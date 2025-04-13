
import { Workout } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { useWorkoutBuilder } from './useWorkoutBuilder';
import { WorkoutForm, BackButton } from './WorkoutForm';
import { ExerciseList } from './ExerciseList';

interface WorkoutBuilderProps {
  planId: string | null;
  onBack: () => void;
  initialWorkout?: Workout;
}

const WorkoutBuilder = ({ planId, onBack, initialWorkout }: WorkoutBuilderProps) => {
  const {
    form,
    exercises,
    isSubmitting,
    showExerciseLibrary,
    editingExerciseId,
    setShowExerciseLibrary,
    setEditingExerciseId,
    onSubmit,
    handleSelectExercise,
    handleDeleteExercise,
    handleUpdateExercise,
    handleDragEnd
  } = useWorkoutBuilder({ planId, onBack, initialWorkout });

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{initialWorkout ? 'Edit Workout' : 'Create New Workout'}</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm 
            form={form} 
            onBack={onBack} 
            isSubmitting={isSubmitting} 
            isEditing={!!initialWorkout}
          >
            <ExerciseList
              exercises={exercises}
              showExerciseLibrary={showExerciseLibrary}
              setShowExerciseLibrary={setShowExerciseLibrary}
              editingExerciseId={editingExerciseId}
              setEditingExerciseId={setEditingExerciseId}
              onDeleteExercise={handleDeleteExercise}
              onUpdateExercise={handleUpdateExercise}
              onDragEnd={handleDragEnd}
              onSelectExercise={handleSelectExercise}
            />
          </WorkoutForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutBuilder;
