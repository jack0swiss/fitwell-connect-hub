
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
import { format, subDays } from 'date-fns';
import TabBar from '@/components/TabBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircularProgressChart } from '@/components/client/CircularProgressChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import ClientListItem from '@/components/coach/ClientListItem';

type ClientOverview = {
  id: string;
  name: string;
  email: string;
  workout_adherence: number;
  nutrition_adherence: number;
  last_active: string;
};

// For demo purposes we'll use mock data
const mockClients: ClientOverview[] = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    email: 'sarah@example.com', 
    workout_adherence: 92, 
    nutrition_adherence: 85, 
    last_active: '2 hours ago'
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    email: 'michael@example.com', 
    workout_adherence: 45, 
    nutrition_adherence: 72, 
    last_active: 'Yesterday'
  },
  { 
    id: '3', 
    name: 'Emma Rodriguez', 
    email: 'emma@example.com', 
    workout_adherence: 78, 
    nutrition_adherence: 90, 
    last_active: '3 days ago'
  }
];

// Mock client detail data for demo
const mockClientDetail = {
  id: '1',
  name: 'Sarah Johnson',
  weight: [
    { date: '1 Apr', value: 68.5 },
    { date: '8 Apr', value: 68.2 },
    { date: '15 Apr', value: 67.8 },
    { date: '22 Apr', value: 67.4 },
    { date: '29 Apr', value: 67.0 },
    { date: '6 May', value: 66.7 }
  ],
  bodyFat: [
    { date: '1 Apr', value: 24.5 },
    { date: '15 Apr', value: 24.0 },
    { date: '29 Apr', value: 23.6 },
    { date: '6 May', value: 23.2 }
  ],
  measurements: {
    waist: [
      { date: '1 Apr', value: 82 },
      { date: '15 Apr', value: 81 },
      { date: '29 Apr', value: 80 },
      { date: '6 May', value: 79 }
    ]
  },
  workout: {
    adherence: 92,
    completedWorkouts: 11,
    plannedWorkouts: 12,
    exerciseProgress: [
      { exercise: 'Squat', startWeight: 70, currentWeight: 90 },
      { exercise: 'Bench Press', startWeight: 50, currentWeight: 65 },
      { exercise: 'Deadlift', startWeight: 100, currentWeight: 120 }
    ]
  },
  nutrition: {
    adherence: 85,
    avgCalories: 1850,
    targetCalories: 2000,
    macroAdherence: 88
  }
};

const CoachProgress = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Filtered clients based on search query
  const filteredClients = mockClients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Selected client data (would come from API in real implementation)
  const selectedClient = mockClientDetail;
  
  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
  };
  
  const handleBack = () => {
    setSelectedClientId(null);
  };

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
              onClick={handleBack}
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
        {selectedClientId ? (
          // Client detail view
          <div className="space-y-6">
            <Card className="fitness-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{selectedClient.name}'s Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 text-fitwell-purple mr-2" />
                      <div>
                        <p className="text-sm font-medium">Workout</p>
                        <p className="text-xs text-muted-foreground">Adherence</p>
                      </div>
                    </div>
                    <Badge variant={selectedClient.workout.adherence > 80 ? "secondary" : "outline"} className={selectedClient.workout.adherence > 80 ? "bg-green-600" : "bg-amber-600"}>
                      {selectedClient.workout.adherence}%
                    </Badge>
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-fitwell-blue mr-2" />
                      <div>
                        <p className="text-sm font-medium">Nutrition</p>
                        <p className="text-xs text-muted-foreground">Adherence</p>
                      </div>
                    </div>
                    <Badge variant={selectedClient.nutrition.adherence > 80 ? "secondary" : "outline"} className={selectedClient.nutrition.adherence > 80 ? "bg-green-600" : "bg-amber-600"}>
                      {selectedClient.nutrition.adherence}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Weight Progress */}
            <Card className="fitness-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-fitwell-purple" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedClient.weight}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center text-sm">
                  <span className="text-green-500 font-medium">-1.8kg</span>
                  <span className="text-muted-foreground"> since program start</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Exercise Progress */}
            <Card className="fitness-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-fitwell-purple" />
                  Strength Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedClient.workout.exerciseProgress.map((exercise, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{exercise.exercise}</span>
                        <span className="text-xs text-green-500">
                          +{exercise.currentWeight - exercise.startWeight}kg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{exercise.startWeight}kg</span>
                        <span>{exercise.currentWeight}kg</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-fitwell-purple" 
                          style={{ width: `${(exercise.currentWeight / (exercise.startWeight * 1.5)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Body Measurements */}
            <Card className="fitness-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-fitwell-blue" />
                  Body Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm mb-1">Body Fat %</p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={selectedClient.bodyFat}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#82ca9d" 
                            name="Body Fat %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-sm mb-1">Waist Circumference (cm)</p>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={selectedClient.measurements.waist}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', borderColor: '#444' }} />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#ffc658" 
                            name="Waist (cm)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Client list view
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="fitness-card col-span-3 md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                    High Adherence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-2xl font-bold">
                    {mockClients.filter(c => c.workout_adherence > 80).length}
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
                    {mockClients.filter(c => c.workout_adherence >= 50 && c.workout_adherence <= 80).length}
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
                    {mockClients.filter(c => c.workout_adherence < 50).length}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">clients</p>
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-lg font-medium mt-6 mb-2">Client Progress Overview</h2>
            
            {filteredClients.length > 0 ? (
              <div className="space-y-4">
                {filteredClients.map(client => (
                  <Card 
                    key={client.id} 
                    className="fitness-card cursor-pointer" 
                    onClick={() => handleClientSelect(client.id)}
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
                              label={`${client.workout_adherence}%`}
                            />
                            <p className="text-xs mt-1">Workout</p>
                          </div>
                          
                          <div className="text-center">
                            <CircularProgressChart
                              percentage={client.nutrition_adherence}
                              size={44}
                              strokeWidth={4}
                              label={`${client.nutrition_adherence}%`}
                            />
                            <p className="text-xs mt-1">Nutrition</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No clients match your search criteria.
              </div>
            )}
          </div>
        )}
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachProgress;
