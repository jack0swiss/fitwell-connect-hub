import React, { useEffect, useState } from 'react';
import { Bell, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TabBar from '@/components/TabBar';
import DailyOverview from '@/components/client/DailyOverview';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface DashboardData {
  name: string;
  motivationalQuote: string;
  workout: {
    title: string;
    duration: string;
    exercises: number;
  };
  nutrition: {
    caloriesConsumed: number;
    caloriesGoal: number;
    nextMeal: string;
  };
  progress: {
    weeklyWorkouts: number;
    weeklyGoal: number;
    weightChange: string;
  };
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch nutrition data
        const { data: nutritionData } = await supabase.rpc('get_daily_nutrition_totals', {
          user_id: user.id,
          log_date: new Date().toISOString().split('T')[0]
        });

        // Fetch current workout assignment and its workouts
        const { data: assignments } = await supabase
          .from('workout_assignments')
          .select(`
            *,
            plan:workout_plans(
              *,
              workouts(*)
            )
          `)
          .is('end_date', null)
          .single();

        // Get today's workout if it exists
        const today = new Date().getDay();
        const todayWorkout = assignments?.plan?.workouts?.find(w => w.day_of_week === today);

        // Get workout completion stats for the week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const { data: workoutLogs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('client_id', user.id)
          .gte('date', startOfWeek.toISOString())
          .eq('completed', true);

        // Get latest body metrics for weight change
        const { data: bodyMetrics } = await supabase
          .from('body_metrics')
          .select('*')
          .eq('client_id', user.id)
          .order('date', { ascending: false })
          .limit(2);

        const weightChange = bodyMetrics && bodyMetrics.length > 1
          ? bodyMetrics[0].weight_kg - bodyMetrics[1].weight_kg
          : 0;

        setDashboardData({
          name: user.user_metadata?.name || 'Client',
          motivationalQuote: "Every small step counts. Keep pushing!",
          workout: {
            title: todayWorkout?.name || 'Rest Day',
            duration: '45 minutes',
            exercises: 8,
          },
          nutrition: {
            caloriesConsumed: nutritionData?.[0]?.total_calories || 0,
            caloriesGoal: 2200, // This should come from nutrition_plans
            nextMeal: 'Protein-rich lunch at 1:00 PM',
          },
          progress: {
            weeklyWorkouts: workoutLogs?.length || 0,
            weeklyGoal: 5,
            weightChange: `${weightChange > 0 ? 'Gained' : 'Lost'} ${Math.abs(weightChange)}kg this week`,
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Subscribe to message updates
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">FitWell Connect</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/client/chat')}>
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-fitwell-purple">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-fitwell-purple rounded-full"></span>
          </Button>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        {dashboardData && (
          <DailyOverview
            userName={dashboardData.name}
            motivationalQuote={dashboardData.motivationalQuote}
            workout={dashboardData.workout}
            nutrition={dashboardData.nutrition}
            progress={dashboardData.progress}
          />
        )}
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientDashboard;
