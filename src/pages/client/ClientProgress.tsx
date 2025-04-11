
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarDays, 
  TrendingUp, 
  Dumbbell, 
  Goal, 
  Scale, 
  Ruler,
  Droplets
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import TabBar from '@/components/TabBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { DailyNutritionSummary } from '@/components/client/DailyNutritionSummary';
import { CircularProgressChart } from '@/components/client/CircularProgressChart';
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define types for the fetched data
type BodyMetric = {
  id: string;
  date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
};

type NutritionAdherence = {
  avg_daily_calories: number;
  target_calories: number;
  calorie_adherence_percentage: number;
};

type WorkoutAdherence = {
  completed_workouts: number;
  planned_workouts: number;
  adherence_percentage: number;
};

const ClientProgress = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<'week' | 'month' | 'year'>('month');
  
  // Get date ranges based on selection
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (selectedDateRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subDays(endDate, 30);
        break;
      case 'year':
        startDate = subDays(endDate, 365);
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Fetch body metrics data
  const { data: bodyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['bodyMetrics', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_metrics')
        .select('*')
        .order('date', { ascending: true })
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data as BodyMetric[];
    }
  });
  
  // Fetch nutrition adherence data
  const { data: nutritionAdherence, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutritionAdherence', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_nutrition_adherence', {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          start_date: startDate,
          end_date: endDate
        });
        
      if (error) throw error;
      return data as NutritionAdherence;
    }
  });
  
  // Fetch workout adherence data
  const { data: workoutAdherence, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutAdherence', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_workout_adherence', {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          start_date: startDate,
          end_date: endDate
        });
        
      if (error) throw error;
      return data as WorkoutAdherence;
    }
  });
  
  // Format chart data
  const weightData = bodyMetrics?.map(metric => ({
    date: format(new Date(metric.date), 'dd MMM'),
    weight: metric.weight_kg
  })).filter(item => item.weight !== null);
  
  const bodyFatData = bodyMetrics?.map(metric => ({
    date: format(new Date(metric.date), 'dd MMM'),
    bodyFat: metric.body_fat_percent
  })).filter(item => item.bodyFat !== null);
  
  const measurementsData = bodyMetrics?.map(metric => ({
    date: format(new Date(metric.date), 'dd MMM'),
    chest: metric.chest_cm,
    waist: metric.waist_cm,
    hip: metric.hip_cm
  })).filter(item => item.chest !== null || item.waist !== null || item.hip !== null);
  
  // Handle adding new metrics (simplified version)
  const handleAddMetrics = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The ability to add new body metrics will be available in the next update."
    });
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <h1 className="text-xl font-bold mb-4">Progress Tracking</h1>
        
        <div className="flex justify-between items-center">
          <Tabs 
            value={selectedDateRange} 
            onValueChange={(v) => setSelectedDateRange(v as 'week' | 'month' | 'year')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Adherence Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="fitness-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Dumbbell className="h-4 w-4 mr-2 text-fitwell-purple" />
                Workout Adherence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {workoutLoading ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
                </div>
              ) : (
                <div className="text-center">
                  <CircularProgressChart
                    percentage={workoutAdherence?.adherence_percentage || 0}
                    size={80}
                    strokeWidth={8}
                    label={`${Math.round(workoutAdherence?.adherence_percentage || 0)}%`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {workoutAdherence?.completed_workouts || 0} of {workoutAdherence?.planned_workouts || 0} workouts completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="fitness-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Droplets className="h-4 w-4 mr-2 text-fitwell-blue" />
                Nutrition Adherence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {nutritionLoading ? (
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-blue"></div>
                </div>
              ) : (
                <div className="text-center">
                  <CircularProgressChart
                    percentage={nutritionAdherence?.calorie_adherence_percentage || 0}
                    size={80}
                    strokeWidth={8}
                    label={`${Math.round(nutritionAdherence?.calorie_adherence_percentage || 0)}%`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg: {Math.round(nutritionAdherence?.avg_daily_calories || 0)} / {nutritionAdherence?.target_calories || 0} kcal
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Weight Chart */}
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Scale className="h-5 w-5 mr-2 text-fitwell-purple" />
                Weight Tracking
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddMetrics}>
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
              </div>
            ) : weightData && weightData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weightData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No weight data available for this time period.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleAddMetrics}
                >
                  Add Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Body Composition */}
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Ruler className="h-5 w-5 mr-2 text-fitwell-blue" />
                Body Measurements
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddMetrics}>
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-blue"></div>
              </div>
            ) : measurementsData && measurementsData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={measurementsData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                    {measurementsData[0]?.chest && (
                      <Line type="monotone" dataKey="chest" stroke="#8884d8" name="Chest (cm)" />
                    )}
                    {measurementsData[0]?.waist && (
                      <Line type="monotone" dataKey="waist" stroke="#82ca9d" name="Waist (cm)" />
                    )}
                    {measurementsData[0]?.hip && (
                      <Line type="monotone" dataKey="hip" stroke="#ffc658" name="Hip (cm)" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No measurement data available for this time period.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleAddMetrics}
                >
                  Add Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Body Fat */}
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Body Fat Percentage
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddMetrics}>
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : bodyFatData && bodyFatData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bodyFatData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="#82ca9d" 
                      activeDot={{ r: 8 }} 
                      name="Body Fat %" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No body fat data available for this time period.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleAddMetrics}
                >
                  Add Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientProgress;
