
import { useState } from 'react';
import { Workout, weekDays } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutListProps {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
}

export const WorkoutList = ({ 
  workouts, 
  setWorkouts, 
  onCreateWorkout, 
  onEditWorkout 
}: WorkoutListProps) => {
  
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

  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Workouts</h3>
        <Button 
          onClick={onCreateWorkout}
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
                      onClick={() => onEditWorkout(workout)}
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
  );
};
