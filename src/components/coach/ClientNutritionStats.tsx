import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NutritionLog, DailyNutritionTotals, NutritionPlan } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ClientNutritionStatsProps {
  clientId: string;
  onBack: () => void;
}

const ClientNutritionStats = ({ clientId, onBack }: ClientNutritionStatsProps) => {
  const [client, setClient] = useState({ id: clientId, name: '' });
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [recentLogs, setRecentLogs] = useState<NutritionLog[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        console.log('Fetching client data for clientId:', clientId);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code !== 'PGRST116') {
            throw profileError;
          }
        }
        
        if (profileData) {
          setClient({
            id: clientId,
            name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || `Client ${clientId.substring(0, 6)}`
          });
        } else {
          console.log('No profile data found for client ID:', clientId);
        }
        
        const { data: planData, error: planError } = await supabase
          .from('nutrition_plans')
          .select('*')
          .eq('client_id', clientId)
          .maybeSingle();
          
        if (planError) {
          console.error('Error fetching plan:', planError);
          throw planError;
        }
        
        console.log('Plan data:', planData);
        setPlan(planData);
        
        const today = new Date();
        const twoWeeksAgo = subDays(today, 14);
        
        const { data: logsData, error: logsError } = await supabase
          .from('nutrition_logs')
          .select('*')
          .eq('client_id', clientId)
          .gte('date', format(twoWeeksAgo, 'yyyy-MM-dd'))
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (logsError) throw logsError;
        setRecentLogs(logsData || []);
        
        const weeklyStats: { [key: string]: any } = {};
        
        for (let i = 0; i < 7; i++) {
          const date = subDays(today, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          weeklyStats[dateStr] = {
            date: dateStr,
            displayDate: format(date, 'dd/MM'),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0
          };
        }
        
        if (logsData) {
          for (const log of logsData) {
            const dateStr = log.date;
            if (weeklyStats[dateStr]) {
              weeklyStats[dateStr].calories += log.calories;
              
              if (log.protein_g) weeklyStats[dateStr].protein += log.protein_g;
              if (log.carbs_g) weeklyStats[dateStr].carbs += log.carbs_g;
              if (log.fat_g) weeklyStats[dateStr].fat += log.fat_g;
            }
          }
        }
        
        const { data: waterData, error: waterError } = await supabase
          .from('water_logs')
          .select('*')
          .eq('client_id', clientId)
          .gte('date', format(twoWeeksAgo, 'yyyy-MM-dd'));
          
        if (waterError) throw waterError;
        
        if (waterData) {
          for (const log of waterData) {
            const dateStr = log.date;
            if (weeklyStats[dateStr]) {
              weeklyStats[dateStr].water += log.amount_ml;
            }
          }
        }
        
        const chartData = Object.values(weeklyStats)
          .sort((a, b) => a.date.localeCompare(b.date));
        
        setWeeklyData(chartData);
      } catch (error) {
        console.error('Error fetching client nutrition data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load client nutrition data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  const handleEditPlan = () => {
    if (plan) {
      navigate(`/coach/nutrition/plan/${plan.id}`);
    } else {
      navigate(`/coach/nutrition/plan/new?clientId=${clientId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="flex items-center text-sm h-8 mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to clients
      </Button>
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{client.name}'s Nutrition</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEditPlan}
          className="flex items-center"
        >
          <Edit className="h-4 w-4 mr-1" />
          {plan ? 'Edit Plan' : 'Create Plan'}
        </Button>
      </div>
      
      <Card className="fitness-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nutrition Plan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {plan ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Calorie Target:</span>
                <span className="font-medium">{plan.daily_calorie_target} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Macros Ratio:</span>
                <span className="font-medium">
                  {plan.macro_carbs_pct}% C / {plan.macro_protein_pct}% P / {plan.macro_fat_pct}% F
                </span>
              </div>
              {plan.plan_notes && (
                <div className="mt-2 text-sm">
                  <div className="font-medium mb-1">Notes:</div>
                  <div className="text-muted-foreground bg-muted p-2 rounded">{plan.plan_notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 text-muted-foreground text-sm">
              No nutrition plan created yet.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="fitness-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">7-Day Calorie Intake</CardTitle>
        </CardHeader>
        <CardContent className="h-60 pt-0">
          <ChartContainer 
            className="h-full" 
            config={{
              calories: { color: "var(--primary)" },
              target: { color: "var(--secondary)" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="displayDate"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar
                  dataKey="calories"
                  radius={4}
                  className="fill-primary"
                />
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="calories" />}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="fitness-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Food Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentLogs.length === 0 ? (
            <div className="py-2 text-muted-foreground text-sm">
              No recent food logs.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Food</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{log.meal_type}</TableCell>
                    <TableCell>{log.food_name}</TableCell>
                    <TableCell className="text-right">{log.calories} kcal</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNutritionStats;
