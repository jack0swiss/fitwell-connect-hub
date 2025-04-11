
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutLog } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Dumbbell } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface WorkoutHistoryProps {
  onViewWorkoutLog: (log: WorkoutLog) => void;
}

export const WorkoutHistory = ({ onViewWorkoutLog }: WorkoutHistoryProps) => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutLogs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('workout_logs')
          .select(`
            *,
            workout:workouts(*)
          `)
          .eq('completed', true)
          .order('date', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        setWorkoutLogs(data || []);
      } catch (error) {
        console.error('Error fetching workout logs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your workout history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  if (workoutLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
        <h3 className="mt-4 text-lg font-medium">No Workout History</h3>
        <p className="text-muted-foreground mt-1">
          You haven't completed any workouts yet. Start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Workout History</h2>
      
      <div className="space-y-3">
        {workoutLogs.map(log => (
          <Card key={log.id} className="fitness-card cursor-pointer" onClick={() => onViewWorkoutLog(log)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{log.workout?.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(log.date), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(log.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
