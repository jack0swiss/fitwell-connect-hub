
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const CoachProgress = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      return profiles.map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || `User ${profile.id.slice(0, 6)}`,
        email: profile.email
      }));
    }
  });

  // Fetch workout logs for selected client
  const { data: workoutData, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutData', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          id,
          date,
          completed,
          workout:workouts(name)
        `)
        .eq('client_id', selectedClient)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching workout data:', error);
        throw error;
      }

      // Process data for chart visualization
      const processedData = data.reduce((acc: Record<string, any>, item) => {
        const date = new Date(item.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, completed: 0, total: 0 };
        }
        acc[date].total += 1;
        if (item.completed) {
          acc[date].completed += 1;
        }
        return acc;
      }, {});

      return Object.values(processedData);
    },
    enabled: !!selectedClient
  });

  // Fetch nutrition logs for selected client
  const { data: nutritionData, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutritionData', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14); // Last 14 days
      
      const { data, error } = await supabase.rpc('get_daily_nutrition_totals', {
        user_id: selectedClient,
        log_date: new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching nutrition data:', error);
        throw error;
      }

      // Get nutrition logs per day
      const { data: logs, error: logsError } = await supabase
        .from('nutrition_logs')
        .select('date, calories')
        .eq('client_id', selectedClient)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (logsError) {
        console.error('Error fetching nutrition logs:', logsError);
        throw logsError;
      }

      // Process logs per day for chart
      const dailyCalories: Record<string, any> = {};
      logs?.forEach(log => {
        const date = log.date;
        if (!dailyCalories[date]) {
          dailyCalories[date] = { date, calories: 0 };
        }
        dailyCalories[date].calories += log.calories;
      });

      return {
        totals: data?.[0] || { 
          total_calories: 0, 
          total_protein: 0, 
          total_carbs: 0, 
          total_fat: 0,
          total_water_ml: 0
        },
        dailyCalories: Object.values(dailyCalories)
      };
    },
    enabled: !!selectedClient
  });

  // Fetch body metrics for selected client
  const { data: bodyMetrics, isLoading: bodyMetricsLoading } = useQuery({
    queryKey: ['bodyMetrics', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('client_id', selectedClient)
        .order('date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching body metrics:', error);
        throw error;
      }

      return data.map(metric => ({
        date: new Date(metric.date).toLocaleDateString(),
        weight: metric.weight_kg,
        bodyFat: metric.body_fat_percent
      }));
    },
    enabled: !!selectedClient
  });

  // Filter clients based on search query
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Client Progress</h1>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Client Selection Sidebar */}
          <div className="md:col-span-1 bg-card p-4 rounded-lg">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {clientsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No clients found
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                {filteredClients.map(client => (
                  <Button
                    key={client.id}
                    variant={selectedClient === client.id ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* Progress Data Area */}
          <div className="md:col-span-3 space-y-4">
            {!selectedClient ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select a client to view their progress data</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Workout Completion Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workout Completion</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    {workoutLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
                      </div>
                    ) : workoutData && workoutData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workoutData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar name="Completed Workouts" dataKey="completed" fill="#8884d8" />
                          <Bar name="Total Workouts" dataKey="total" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No workout data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Nutrition Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nutrition Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nutritionLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
                      </div>
                    ) : nutritionData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Calories</div>
                            <div className="text-lg font-semibold">{nutritionData.totals.total_calories || 0}</div>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Protein</div>
                            <div className="text-lg font-semibold">{nutritionData.totals.total_protein || 0}g</div>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Carbs</div>
                            <div className="text-lg font-semibold">{nutritionData.totals.total_carbs || 0}g</div>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Fat</div>
                            <div className="text-lg font-semibold">{nutritionData.totals.total_fat || 0}g</div>
                          </div>
                        </div>
                        
                        {nutritionData.dailyCalories && nutritionData.dailyCalories.length > 0 ? (
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={nutritionData.dailyCalories}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="calories" 
                                  stroke="#8884d8" 
                                  activeDot={{ r: 8 }} 
                                  name="Daily Calories"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            No nutrition history data
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">No nutrition data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Body Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Body Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bodyMetricsLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
                      </div>
                    ) : bodyMetrics && bodyMetrics.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={bodyMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="weight" 
                              stroke="#8884d8" 
                              name="Weight (kg)" 
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="bodyFat" 
                              stroke="#82ca9d" 
                              name="Body Fat %" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">No body metrics available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachProgress;
