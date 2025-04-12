
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Info, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TabBar from '@/components/TabBar';
import { supabase } from '@/integrations/supabase/client';
import { NutritionPlan, DailyNutritionTotals, NutritionLog } from '@/types/nutrition';
import { DailyNutritionSummary } from '@/components/client/DailyNutritionSummary';
import { MealLogList } from '@/components/client/MealLogList';
import { AddFoodLogDialog } from '@/components/client/AddFoodLogDialog';
import { AddWaterLogDialog } from '@/components/client/AddWaterLogDialog';
import { toast } from '@/components/ui/use-toast';

const ClientNutrition = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyNutritionTotals | null>(null);
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [addWaterDialogOpen, setAddWaterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        console.log("Fetching nutrition data for date:", formattedDate);
        
        // Fetch nutrition plan
        const { data: planData, error: planError } = await supabase
          .from('nutrition_plans')
          .select('*')
          .maybeSingle();
          
        if (planError) throw planError;
        console.log("Nutrition plan data:", planData);
        setNutritionPlan(planData);
        
        // Fetch nutrition logs for selected date
        const { data: logsData, error: logsError } = await supabase
          .from('nutrition_logs')
          .select('*')
          .eq('date', formattedDate)
          .order('created_at', { ascending: true });
          
        if (logsError) throw logsError;
        console.log("Nutrition logs:", logsData);
        setNutritionLogs(logsData || []);
        
        // Fetch daily nutrition totals
        const { data: totalsData, error: totalsError } = await supabase
          .rpc('get_daily_nutrition_totals', { 
            user_id: (await supabase.auth.getUser()).data.user?.id,
            log_date: formattedDate
          });
          
        if (totalsError) {
          console.error('Error fetching totals:', totalsError);
          throw totalsError;
        }
        
        console.log("Raw totals data:", totalsData);
        
        // Map the data to match our expected type
        if (totalsData?.length > 0) {
          const rawData = totalsData[0];
          
          // Get water logs for the selected date
          const { data: waterData, error: waterError } = await supabase
            .from('water_logs')
            .select('amount_ml')
            .eq('date', formattedDate);
            
          if (waterError) throw waterError;
          
          // Calculate total water
          const totalWater = waterData?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0;
          
          // Map the data to match our DailyNutritionTotals type
          const mappedData: DailyNutritionTotals = {
            total_calories: rawData.total_calories || 0,
            total_protein: rawData.total_protein || 0,
            total_carbs: rawData.total_carbohydrates || 0,
            total_fat: rawData.total_fats || 0,
            total_water_ml: totalWater
          };
          
          console.log("Mapped nutrition totals:", mappedData);
          setDailyTotals(mappedData);
        } else {
          // Set default values if no data is returned
          setDailyTotals({
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0,
            total_water_ml: 0
          });
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load nutrition data',
          variant: 'destructive',
        });
        
        // Set default values on error
        setDailyTotals({
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          total_water_ml: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNutritionData();
  }, [formattedDate]);
  
  const refreshData = () => {
    const fetchUpdatedTotals = async () => {
      try {
        console.log("Refreshing nutrition data");
        
        // Fetch updated nutrition logs
        const { data: logsData, error: logsError } = await supabase
          .from('nutrition_logs')
          .select('*')
          .eq('date', formattedDate)
          .order('created_at', { ascending: true });
          
        if (logsError) throw logsError;
        setNutritionLogs(logsData || []);
        
        // Fetch updated daily nutrition totals
        const { data: totalsData, error: totalsError } = await supabase
          .rpc('get_daily_nutrition_totals', { 
            user_id: (await supabase.auth.getUser()).data.user?.id,
            log_date: formattedDate
          });
          
        if (totalsError) throw totalsError;
        
        // Map the data to match our expected type
        if (totalsData?.length > 0) {
          const rawData = totalsData[0];
          
          // Get water logs for the selected date
          const { data: waterData, error: waterError } = await supabase
            .from('water_logs')
            .select('amount_ml')
            .eq('date', formattedDate);
            
          if (waterError) throw waterError;
          
          // Calculate total water
          const totalWater = waterData?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0;
          
          // Map the data to match our DailyNutritionTotals type
          const mappedData: DailyNutritionTotals = {
            total_calories: rawData.total_calories || 0,
            total_protein: rawData.total_protein || 0,
            total_carbs: rawData.total_carbohydrates || 0,
            total_fat: rawData.total_fats || 0,
            total_water_ml: totalWater
          };
          
          setDailyTotals(mappedData);
        } else {
          // Set default values if no data is returned
          setDailyTotals({
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0,
            total_water_ml: 0
          });
        }
      } catch (error) {
        console.error('Error refreshing nutrition data:', error);
      }
    };
    
    fetchUpdatedTotals();
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Nutrition</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
          </div>
        ) : (
          <>
            <DailyNutritionSummary 
              totals={dailyTotals} 
              plan={nutritionPlan} 
            />
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Today's Food</h2>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setAddWaterDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Droplets className="h-4 w-4 mr-1" />
                  Water
                </Button>
                <Button 
                  onClick={() => setAddFoodDialogOpen(true)}
                  size="sm"
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              </div>
            </div>
            
            <MealLogList 
              logs={nutritionLogs} 
              onDeleteLog={refreshData} 
            />
            
            <AddFoodLogDialog 
              open={addFoodDialogOpen} 
              onOpenChange={setAddFoodDialogOpen} 
              date={formattedDate}
              onAddSuccess={refreshData}
            />
            
            <AddWaterLogDialog
              open={addWaterDialogOpen}
              onOpenChange={setAddWaterDialogOpen}
              date={formattedDate}
              onAddSuccess={refreshData}
            />
          </>
        )}
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientNutrition;
