
import { useState } from 'react';
import { format } from 'date-fns';
import { Utensils, MoreVertical, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NutritionLog } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface MealLogListProps {
  logs: NutritionLog[];
  onDeleteLog: () => void;
}

export const MealLogList = ({ logs, onDeleteLog }: MealLogListProps) => {
  const [deleting, setDeleting] = useState(false);
  
  // Group logs by meal type
  const groupedLogs: { [key: string]: NutritionLog[] } = {};
  logs.forEach((log) => {
    if (!groupedLogs[log.meal_type]) {
      groupedLogs[log.meal_type] = [];
    }
    groupedLogs[log.meal_type].push(log);
  });
  
  const handleDeleteLog = async (logId: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', logId);
        
      if (error) throw error;
      
      toast({
        title: 'Food entry deleted',
        description: 'The food entry has been removed from your log'
      });
      
      onDeleteLog();
    } catch (error) {
      console.error('Error deleting food log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete food entry',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };
  
  const mealTypes = Object.keys(groupedLogs).sort((a, b) => {
    const mealOrder = { 'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4 };
    return (mealOrder[a as keyof typeof mealOrder] || 99) - (mealOrder[b as keyof typeof mealOrder] || 99);
  });

  if (logs.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No food entries for today. Click "Add Food" to log your meals.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {mealTypes.map((mealType) => (
        <Card key={mealType} className="fitness-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              {mealType}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ul className="divide-y divide-border/30">
              {groupedLogs[mealType].map((log) => (
                <li key={log.id} className="py-2 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{log.food_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.quantity && log.unit 
                        ? `${log.quantity} ${log.unit}, ` 
                        : ''}
                      {log.calories} kcal
                      {log.protein_g !== null && log.carbs_g !== null && log.fat_g !== null && 
                        ` • P: ${log.protein_g}g C: ${log.carbs_g}g F: ${log.fat_g}g`}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={deleting}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
