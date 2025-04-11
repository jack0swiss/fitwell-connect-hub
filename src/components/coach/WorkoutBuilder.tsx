
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, Workout, WorkoutExercise, weekDays } from '@/types/workout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ExerciseLibrary } from './ExerciseLibrary';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Plus, Edit, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  day_of_week: z.string().optional(),
});

interface WorkoutBuilderProps {
  planId: string | null;
  onBack: () => void;
  initialWorkout?: Workout;
}

export const WorkoutBuilder = ({ planId, onBack, initialWorkout }: WorkoutBuilderProps) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: initialWorkout?.name || '',
      description: initialWorkout?.description || '',
      day_of_week: initialWorkout?.day_of_week !== null ? initialWorkout.day_of_week.toString() : undefined,
    },
  });

  useEffect(() => {
    const fetchWorkoutExercises = async () => {
      if (!initialWorkout) return;

      try {
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq('workout_id', initialWorkout.id)
          .order('order_index');

        if (error) throw error;
        setExercises(data);
      } catch (error) {
        console.error('Error fetching workout exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout exercises',
          variant: 'destructive',
        });
      }
    };

    if (initialWorkout) {
      fetchWorkoutExercises();
    }
  }, [initialWorkout]);

  const onSubmit = async (values: z.infer<typeof workoutSchema>) => {
    try {
      setIsSubmitting(true);

      let workoutId = initialWorkout?.id;
      const dayOfWeek = values.day_of_week ? parseInt(values.day_of_week) : null;

      // Create or update the workout
      if (!workoutId) {
        // Create new workout
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            name: values.name,
            description: values.description || null,
            day_of_week: dayOfWeek,
            plan_id: planId,
          })
          .select()
          .single();

        if (error) throw error;
        workoutId = data.id;
      } else {
        // Update existing workout
        const { error } = await supabase
          .from('workouts')
          .update({
            name: values.name,
            description: values.description || null,
            day_of_week: dayOfWeek,
          })
          .eq('id', workoutId);

        if (error) throw error;
      }

      // Save workout exercises
      if (exercises.length > 0) {
        // First, delete any existing exercises not in our list (if updating)
        if (initialWorkout) {
          const existingIds = exercises
            .filter(e => e.id && !e.id.startsWith('new-'))
            .map(e => e.id);
            
          if (existingIds.length > 0) {
            const { error } = await supabase
              .from('workout_exercises')
              .delete()
              .eq('workout_id', workoutId)
              .not('id', 'in', `(${existingIds.join(',')})`);
              
            if (error) throw error;
          } else {
            // If we have no existing IDs, delete all exercises for this workout
            const { error } = await supabase
              .from('workout_exercises')
              .delete()
              .eq('workout_id', workoutId);
              
            if (error) throw error;
          }
        }

        // Now insert or update exercises
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];
          const isNew = !exercise.id || exercise.id.startsWith('new-');
          
          if (isNew) {
            // Insert new exercise
            const { error } = await supabase
              .from('workout_exercises')
              .insert({
                workout_id: workoutId,
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                rest_time: exercise.rest_time,
                notes: exercise.notes,
                order_index: i,
                is_superset: exercise.is_superset,
                superset_group: exercise.superset_group,
              });
              
            if (error) throw error;
          } else {
            // Update existing exercise
            const { error } = await supabase
              .from('workout_exercises')
              .update({
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                rest_time: exercise.rest_time,
                notes: exercise.notes,
                order_index: i,
                is_superset: exercise.is_superset,
                superset_group: exercise.superset_group,
              })
              .eq('id', exercise.id);
              
            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Success',
        description: initialWorkout ? 'Workout updated successfully' : 'Workout created successfully',
      });

      // Go back to the workout plan
      onBack();

    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (editingExerciseId) {
      // Update existing exercise
      setExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === editingExerciseId 
            ? { ...ex, exercise_id: exercise.id, exercise } 
            : ex
        )
      );
      setEditingExerciseId(null);
    } else {
      // Add new exercise
      const newExercise: WorkoutExercise = {
        id: `new-${Date.now()}`,
        workout_id: initialWorkout?.id || null,
        exercise_id: exercise.id,
        sets: 3,
        reps: 10,
        weight: null,
        rest_time: 60,
        notes: null,
        order_index: exercises.length,
        is_superset: false,
        superset_group: null,
        exercise
      };
      
      setExercises([...exercises, newExercise]);
    }
    
    setShowExerciseLibrary(false);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (id: string, updates: Partial<WorkoutExercise>) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  };

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
          <CardTitle>{initialWorkout ? 'Edit Workout' : 'Create New Workout'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Upper Body Strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="Describe this workout..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Exercises</h3>
                  <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Exercise Library</DialogTitle>
                      </DialogHeader>
                      <ExerciseLibrary onSelectExercise={handleSelectExercise} />
                    </DialogContent>
                  </Dialog>
                </div>

                {exercises.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md text-muted-foreground">
                    No exercises added yet. Click "Add Exercise" to build your workout.
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="exercises">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {exercises.map((exercise, index) => (
                            <Draggable 
                              key={exercise.id} 
                              draggableId={exercise.id} 
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-md p-3 bg-card"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="text-muted-foreground">
                                        <GripVertical size={16} />
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
                                    <div className="flex gap-1">
                                      <Dialog
                                        open={editingExerciseId === exercise.id && showExerciseLibrary}
                                        onOpenChange={(open) => {
                                          setShowExerciseLibrary(open);
                                          if (!open) setEditingExerciseId(null);
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => {
                                              setEditingExerciseId(exercise.id);
                                              setShowExerciseLibrary(true);
                                            }}
                                          >
                                            <Edit size={16} />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                          <DialogHeader>
                                            <DialogTitle>Change Exercise</DialogTitle>
                                          </DialogHeader>
                                          <ExerciseLibrary onSelectExercise={handleSelectExercise} />
                                        </DialogContent>
                                      </Dialog>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleDeleteExercise(exercise.id)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    <div>
                                      <label className="text-xs text-muted-foreground">Sets</label>
                                      <Input
                                        type="number"
                                        value={exercise.sets}
                                        min={1}
                                        onChange={(e) => handleUpdateExercise(exercise.id, { sets: parseInt(e.target.value) || 1 })}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Reps</label>
                                      <Input
                                        type="number"
                                        value={exercise.reps || ''}
                                        min={0}
                                        onChange={(e) => handleUpdateExercise(exercise.id, { reps: e.target.value ? parseInt(e.target.value) : null })}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Weight (kg)</label>
                                      <Input
                                        type="number"
                                        value={exercise.weight || ''}
                                        min={0}
                                        step={2.5}
                                        onChange={(e) => handleUpdateExercise(exercise.id, { weight: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-muted-foreground">Rest (sec)</label>
                                      <Input
                                        type="number"
                                        value={exercise.rest_time || ''}
                                        min={0}
                                        step={15}
                                        onChange={(e) => handleUpdateExercise(exercise.id, { rest_time: e.target.value ? parseInt(e.target.value) : null })}
                                        className="h-8 mt-1"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <label className="text-xs text-muted-foreground">Notes</label>
                                    <Textarea
                                      value={exercise.notes || ''}
                                      placeholder="Notes for this exercise..."
                                      onChange={(e) => handleUpdateExercise(exercise.id, { notes: e.target.value || null })}
                                      className="min-h-[60px] mt-1"
                                    />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {initialWorkout ? 'Update Workout' : 'Create Workout'}
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
