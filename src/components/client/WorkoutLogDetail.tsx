
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutLog, ExerciseLog } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface WorkoutLogDetailProps {
  workoutLog: WorkoutLog;
  onBack: () => void;
}

interface ExerciseLogWithDetails extends ExerciseLog {
  exercise?: {
    id: number;
    name: string;
  };
}

interface GroupedExerciseLogs {
  [exerciseId: string]: ExerciseLogWithDetails[];
}

export const WorkoutLogDetail = ({ workoutLog, onBack }: WorkoutLogDetailProps) => {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('exercise_logs')
          .select(`
            *,
            exercise:exercises(id, name)
          `)
          .eq('workout_log_id', workoutLog.id)
          .order('exercise_id, set_number');
          
        if (error) throw error;
        setExerciseLogs(data || []);
      } catch (error) {
        console.error('Error fetching exercise logs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExerciseLogs();
  }, [workoutLog.id]);

  const groupExercisesByType = (logs: ExerciseLogWithDetails[]): GroupedExerciseLogs => {
    return logs.reduce((acc, log) => {
      if (!log.exercise_id) return acc;
      
      const exerciseId = log.exercise_id.toString();
      if (!acc[exerciseId]) {
        acc[exerciseId] = [];
      }
      
      acc[exerciseId].push(log);
      return acc;
    }, {} as GroupedExerciseLogs);
  };

  const groupedLogs = groupExercisesByType(exerciseLogs);

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
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to history
      </Button>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{workoutLog.workout?.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(new Date(workoutLog.date), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {workoutLog.notes && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-sm">{workoutLog.notes}</p>
            </div>
          )}
          
          {Object.keys(groupedLogs).length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No exercise data recorded for this workout.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([exerciseId, logs]) => (
                <div key={exerciseId}>
                  <h3 className="text-lg font-medium mb-2">{logs[0].exercise?.name}</h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Set</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.set_number}</TableCell>
                          <TableCell>{log.weight || '-'}</TableCell>
                          <TableCell>{log.reps || '-'}</TableCell>
                          <TableCell>{log.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
