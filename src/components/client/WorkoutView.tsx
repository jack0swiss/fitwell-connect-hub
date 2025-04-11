
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutExercise, WorkoutLog, ExerciseLog } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Clock, Dumbbell, PlayCircle, Repeat, Star, Timer } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface WorkoutViewProps {
  workout: Workout;
  onBack: () => void;
}

export const WorkoutView = ({ workout, onBack }: WorkoutViewProps) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentWorkoutLog, setCurrentWorkoutLog] = useState<WorkoutLog | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastWorkoutData, setLastWorkoutData] = useState<{
    [key: string]: { weight: number | null; reps: number | null }[]
  }>({});

  useEffect(() => {
    const fetchWorkoutExercises = async () => {
      try {
        setLoading(true);
        
        // Fetch the workout exercises
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq('workout_id', workout.id)
          .order('order_index');
          
        if (error) throw error;
        setExercises(data || []);
        
        // Fetch the last workout log for this workout
        const { data: logData, error: logError } = await supabase
          .from('workout_logs')
          .select(`
            *,
            exercise_logs!exercise_logs(*)
          `)
          .eq('workout_id', workout.id)
          .eq('completed', true)
          .order('date', { ascending: false })
          .limit(1);
          
        if (logError) throw logError;
        
        if (logData && logData.length > 0) {
          const lastLog = logData[0];
          const exerciseLogs = lastLog.exercise_logs as ExerciseLog[];
          
          // Create a map of exercise data from the last workout
          const exerciseData: {[key: string]: { weight: number | null; reps: number | null }[]} = {};
          
          exerciseLogs.forEach(log => {
            if (!log.exercise_id) return;
            
            const exerciseId = log.exercise_id.toString();
            if (!exerciseData[exerciseId]) {
              exerciseData[exerciseId] = [];
            }
            
            exerciseData[exerciseId][log.set_number - 1] = {
              weight: log.weight,
              reps: log.reps
            };
          });
          
          setLastWorkoutData(exerciseData);
        }
      } catch (error) {
        console.error('Error fetching workout details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutExercises();
  }, [workout.id]);

  const startWorkout = async () => {
    try {
      // Create a new workout log
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          workout_id: workout.id,
          date: new Date().toISOString(),
          completed: false,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setCurrentWorkoutLog(data);
      setWorkoutStarted(true);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
      
      // Start the timer
      const intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      setTimer(intervalId);
      
    } catch (error) {
      console.error('Error starting workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to start workout',
        variant: 'destructive',
      });
    }
  };

  const logSet = async (formData: z.infer<typeof setSchema>) => {
    try {
      if (!currentWorkoutLog) return;
      
      const currentExercise = exercises[currentExerciseIndex];
      
      // Log the current set
      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({
          workout_log_id: currentWorkoutLog.id,
          exercise_id: currentExercise.exercise_id,
          set_number: currentSetIndex + 1,
          reps: formData.reps || null,
          weight: formData.weight || null,
          notes: formData.notes || null,
        })
        .select();
        
      if (error) throw error;
      
      // Add the new log to state
      setExerciseLogs([...exerciseLogs, data[0]]);
      
      // Move to the next set or exercise
      const totalSets = currentExercise.sets;
      
      if (currentSetIndex < totalSets - 1) {
        // Move to the next set
        setCurrentSetIndex(currentSetIndex + 1);
        form.reset({
          reps: currentExercise.reps,
          weight: currentExercise.weight,
          notes: '',
        });
      } else if (currentExerciseIndex < exercises.length - 1) {
        // Move to the next exercise
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        
        const nextExercise = exercises[currentExerciseIndex + 1];
        form.reset({
          reps: nextExercise.reps,
          weight: nextExercise.weight,
          notes: '',
        });
      } else {
        // Workout complete
        completeWorkout();
      }
      
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: 'Error',
        description: 'Failed to log set',
        variant: 'destructive',
      });
    }
  };

  const completeWorkout = async () => {
    try {
      if (!currentWorkoutLog) return;
      
      // Update the workout log as completed
      const { error } = await supabase
        .from('workout_logs')
        .update({ completed: true })
        .eq('id', currentWorkoutLog.id);
        
      if (error) throw error;
      
      // Stop the timer
      if (timer) {
        clearInterval(timer);
      }
      
      setShowCongrats(true);
      
    } catch (error) {
      console.error('Error completing workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete workout',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const setSchema = z.object({
    reps: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof setSchema>>({
    resolver: zodResolver(setSchema),
    defaultValues: {
      reps: null,
      weight: null,
      notes: '',
    },
  });

  useEffect(() => {
    // Set initial form values when exercises are loaded
    if (exercises.length > 0) {
      form.reset({
        reps: exercises[0].reps,
        weight: exercises[0].weight,
        notes: '',
      });
    }
  }, [exercises, form]);

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  if (showCongrats) {
    return (
      <div className="space-y-4">
        <Card className="fitness-card">
          <CardContent className="p-6 text-center">
            <div className="py-8">
              <div className="mx-auto w-16 h-16 bg-fitwell-purple rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
              <p className="text-muted-foreground mb-4">
                Great job! You've completed your {workout.name} workout.
              </p>
              <div className="flex justify-center gap-4 text-sm mb-6">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-fitwell-purple" />
                  <span>Duration: {formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center">
                  <Dumbbell className="h-4 w-4 mr-1 text-fitwell-purple" />
                  <span>Exercises: {exercises.length}</span>
                </div>
              </div>
              <Button onClick={onBack} className="mt-2">
                Back to Workouts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (workoutStarted && exercises.length > 0) {
    const currentExercise = exercises[currentExerciseIndex];
    const exerciseId = currentExercise.exercise_id?.toString() || '';
    const lastExerciseData = lastWorkoutData[exerciseId] || [];
    const lastSetData = lastExerciseData[currentSetIndex] || { weight: null, reps: null };
    
    return (
      <div className="space-y-4">
        <Card className="fitness-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{workout.name}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Exercise {currentExerciseIndex + 1}/{exercises.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-4 border-t border-b">
              <h3 className="text-xl font-semibold">{currentExercise.exercise?.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Repeat className="h-4 w-4 mr-1" />
                  <span>Set {currentSetIndex + 1}/{currentExercise.sets}</span>
                </div>
                {currentExercise.rest_time && (
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 mr-1" />
                    <span>Rest: {currentExercise.rest_time}s</span>
                  </div>
                )}
              </div>
              {currentExercise.notes && (
                <div className="mt-2 text-sm p-2 bg-muted rounded">
                  <p>{currentExercise.notes}</p>
                </div>
              )}
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(logSet)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="2.5"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        {lastSetData.weight !== null && (
                          <div className="text-xs mt-1 flex items-center">
                            <span className="text-muted-foreground">Previous: {lastSetData.weight} kg</span>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                          />
                        </FormControl>
                        {lastSetData.reps !== null && (
                          <div className="text-xs mt-1 flex items-center">
                            <span className="text-muted-foreground">Previous: {lastSetData.reps} reps</span>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="How did this set feel?"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-2 pt-2">
                  <Button type="submit">
                    <Check className="h-4 w-4 mr-2" />
                    Log Set
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
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
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to workouts
      </Button>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{workout.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {workout.description && (
            <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>
          )}
          
          <h3 className="text-md font-medium mb-3">Exercises</h3>
          
          <div className="space-y-3 mb-6">
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No exercises in this workout yet.
              </p>
            ) : (
              exercises.map((exercise, index) => (
                <div key={exercise.id} className="p-3 border rounded-md">
                  <div className="flex items-center">
                    <div className="bg-fitwell-purple-dark rounded-full w-6 h-6 flex items-center justify-center text-white text-xs mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{exercise.exercise?.name}</h4>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>{exercise.sets} sets</span>
                        {exercise.reps && <span>× {exercise.reps} reps</span>}
                        {exercise.weight && <span>@ {exercise.weight} kg</span>}
                      </div>
                    </div>
                  </div>
                  {exercise.notes && (
                    <div className="mt-2 text-xs p-2 bg-muted rounded ml-9">
                      <p>{exercise.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <Button 
            className="w-full" 
            disabled={exercises.length === 0}
            onClick={startWorkout}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
