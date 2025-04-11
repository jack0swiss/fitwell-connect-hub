
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutPlan, weekDays } from '@/types/workout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, ArrowLeft, Calendar } from 'lucide-react';
import { WorkoutBuilder } from './WorkoutBuilder';
import { toast } from '@/components/ui/use-toast';

const workoutPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
});

interface WorkoutPlanBuilderProps {
  initialPlan?: WorkoutPlan;
  onBack: () => void;
}

export const WorkoutPlanBuilder = ({ initialPlan, onBack }: WorkoutPlanBuilderProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  
  const form = useForm<z.infer<typeof workoutPlanSchema>>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: initialPlan?.name || '',
      description: initialPlan?.description || '',
    },
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!initialPlan) return;
      
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('plan_id', initialPlan.id)
          .order('day_of_week');
          
        if (error) throw error;
        setWorkouts(data || []);
      } catch (error) {
        console.error('Error loading workouts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workouts',
          variant: 'destructive',
        });
      }
    };
    
    if (initialPlan) {
      fetchWorkouts();
    }
  }, [initialPlan]);

  const onSubmit = async (values: z.infer<typeof workoutPlanSchema>) => {
    try {
      setIsSubmitting(true);
      
      let planId = initialPlan?.id;
      
      if (!planId) {
        // Create new plan
        const { data, error } = await supabase
          .from('workout_plans')
          .insert({
            name: values.name,
            description: values.description || null,
            coach_id: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();
          
        if (error) throw error;
        planId = data.id;
      } else {
        // Update existing plan
        const { error } = await supabase
          .from('workout_plans')
          .update({
            name: values.name,
            description: values.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', planId);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: initialPlan ? 'Plan updated successfully' : 'Plan created successfully',
      });
      
      // Return to plans list
      onBack();
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout plan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) throw error;
      
      setWorkouts(workouts.filter(w => w.id !== workoutId));
      toast({
        title: 'Success',
        description: 'Workout deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workout',
        variant: 'destructive',
      });
    }
  };

  const handleWorkoutSaved = () => {
    // Refresh workouts after editing
    if (initialPlan) {
      supabase
        .from('workouts')
        .select('*')
        .eq('plan_id', initialPlan.id)
        .order('day_of_week')
        .then(({ data, error }) => {
          if (error) {
            console.error('Error refreshing workouts:', error);
          } else {
            setWorkouts(data || []);
          }
        });
    }
    
    setSelectedWorkout(null);
    setIsCreatingWorkout(false);
  };

  if (selectedWorkout || isCreatingWorkout) {
    return (
      <WorkoutBuilder 
        planId={initialPlan?.id || null}
        initialWorkout={selectedWorkout || undefined}
        onBack={handleWorkoutSaved}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="flex items-center text-sm h-8 mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to plans
      </Button>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{initialPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3-Day Split for Beginners" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this workout plan..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {initialPlan && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Workouts</h3>
                    <Button 
                      onClick={() => setIsCreatingWorkout(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workout
                    </Button>
                  </div>

                  {workouts.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-md text-muted-foreground">
                      No workouts added yet. Click "Add Workout" to build your plan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workouts.map(workout => (
                        <Card key={workout.id} className="fitness-card">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{workout.name}</h4>
                                {workout.day_of_week !== null && (
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{weekDays[workout.day_of_week]}</span>
                                  </div>
                                )}
                                {workout.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{workout.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setSelectedWorkout(workout)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteWorkout(workout.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {initialPlan ? 'Update Plan' : 'Create Plan'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
