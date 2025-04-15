import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  TrendingUp, 
  Dumbbell, 
  Users, 
  Search,
  Calendar,
  UserCheck,
  Scale
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import TabBar from '@/components/TabBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircularProgressChart } from '@/components/client/CircularProgressChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface ClientProgress {
  id: string;
  name: string;
  email: string;
  workout_adherence: number;
  nutrition_adherence: number;
  last_active: string;
  metrics?: {
    weight: { date: string; value: number; }[];
    bodyFat: { date: string; value: number; }[];
    measurements: {
      waist: { date: string; value: number; }[];
    };
  };
}

const CoachProgress = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  const { clients, isLoading } = useQuery({
    queryKey: ['clientProgress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('workout_assignments')
        .select('client_id')
        .eq('end_date', null);

      if (assignmentsError) throw assignmentsError;

      const clientIds = [...new Set(assignmentsData.map(a => a.client_id))].filter(Boolean);
      
      if (!clientIds.length) return [];

      const clientsWithProgress = await Promise.all(clientIds.map(async (clientId) => {
        if (!clientId) return null;
        
        const workoutData = await supabase.rpc('get_workout_adherence', {
          user_id: clientId,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

        const adherencePercentage = workoutData?.data?.[0]?.adherence_percentage || 0;

        const { data: nutritionData } = await supabase.rpc('get_nutrition_adherence', {
          user_id: clientId,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

        const { data: lastActive } = await supabase
          .from('workout_logs')
          .select('created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          id: clientId,
          name: `Client ${clientId.substring(0, 6)}`,
          email: "client@example.com",
          workout_adherence: adherencePercentage,
          nutrition_adherence: nutritionData?.[0]?.calorie_adherence_percentage || 0,
          last_active: lastActive?.created_at || 'Never'
        };
      }));

      return clientsWithProgress.filter(Boolean) as ClientProgress[];
    }
  });

  const { data: selectedClientMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['clientMetrics', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null;

      const { data: metrics, error } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('date', { ascending: true });

      if (error) throw error;

      return {
        weight: metrics.map(m => ({ date: format(new Date(m.date), 'dd MMM'), value: m.weight_kg })),
        bodyFat: metrics.map(m => ({ date: format(new Date(m.date), 'dd MMM'), value: m.body_fat_percent })),
        measurements: {
          waist: metrics.map(m => ({ date: format(new Date(m.date), 'dd MMM'), value: m.waist_cm }))
        }
      };
    },
    enabled: !!selectedClientId
  });

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <h1 className="text-xl font-bold mb-4">Client Progress</h1>
        
        {!selectedClientId && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        
        {selectedClientId && (
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center h-8"
              onClick={() => setSelectedClientId(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to clients
            </Button>
            <div className="flex-1 flex justify-end">
              <select 
                className="bg-muted border-0 rounded p-1 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter')}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>
        )}
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        {selectedClientId && selectedClientMetrics ? (
          <div className="space-y-6">
            {isLoadingMetrics ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
              </div>
            ) : (
              <>
                <Card className="fitness-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Client Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium">Weight Progress</p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedClientMetrics.weight}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium">Body Fat %</p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedClientMetrics.bodyFat}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="fitness-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm font-medium">Waist Circumference (cm)</p>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedClientMetrics.measurements.waist}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#ffc658" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {filteredClients.length > 0 ? (
                <>
                  <Card className="fitness-card col-span-3 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                        High Adherence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-2xl font-bold">
                        {filteredClients.filter(c => c.workout_adherence > 80).length}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">clients</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="fitness-card col-span-3 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Dumbbell className="h-4 w-4 mr-2 text-amber-500" />
                        Medium Adherence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-2xl font-bold">
                        {filteredClients.filter(c => c.workout_adherence >= 50 && c.workout_adherence <= 80).length}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">clients</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="fitness-card col-span-3 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-2 text-destructive" />
                        Low Adherence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-2xl font-bold">
                        {filteredClients.filter(c => c.workout_adherence < 50).length}
                      </div>
                      <p className="text-xs text-center text-muted-foreground">clients</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No clients found matching your search criteria.
                </div>
              )}
            </div>
            
            {filteredClients.length > 0 && (
              <>
                <h2 className="text-lg font-medium mt-6 mb-2">Client Progress Overview</h2>
                <div className="space-y-4">
                  {filteredClients.map(client => (
                    <Card 
                      key={client.id} 
                      className="fitness-card cursor-pointer" 
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>Active {client.last_active}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <div className="text-center">
                              <CircularProgressChart
                                percentage={client.workout_adherence}
                                size={44}
                                strokeWidth={4}
                                label={`${Math.round(client.workout_adherence)}%`}
                              />
                              <p className="text-xs mt-1">Workout</p>
                            </div>
                            
                            <div className="text-center">
                              <CircularProgressChart
                                percentage={client.nutrition_adherence}
                                size={44}
                                strokeWidth={4}
                                label={`${Math.round(client.nutrition_adherence)}%`}
                              />
                              <p className="text-xs mt-1">Nutrition</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachProgress;
