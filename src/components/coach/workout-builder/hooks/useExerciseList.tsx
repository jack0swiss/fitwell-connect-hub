
import { useState } from 'react';
import { WorkoutExercise, Exercise } from '@/types/workout';

export function useExerciseList(initialExercises: WorkoutExercise[] = []) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const handleSelectExercise = (exercise: Exercise) => {
    if (editingExerciseId) {
      setExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === editingExerciseId 
            ? { ...ex, exercise_id: exercise.id, exercise } 
            : ex
        )
      );
      setEditingExerciseId(null);
    } else {
      const newExercise: WorkoutExercise = {
        id: `new-${Date.now()}`,
        workout_id: null,
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

  return {
    exercises,
    showExerciseLibrary,
    editingExerciseId,
    setExercises,
    setShowExerciseLibrary,
    setEditingExerciseId,
    handleSelectExercise,
    handleDeleteExercise,
    handleUpdateExercise,
    handleDragEnd
  };
}
