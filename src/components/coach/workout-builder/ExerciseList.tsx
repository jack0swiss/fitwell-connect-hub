
import { WorkoutExercise } from '@/types/workout';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExerciseLibrary } from '@/components/coach/ExerciseLibrary';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { ExerciseItem } from './ExerciseItem';

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  showExerciseLibrary: boolean;
  setShowExerciseLibrary: (show: boolean) => void;
  editingExerciseId: string | null;
  setEditingExerciseId: (id: string | null) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateExercise: (id: string, updates: Partial<WorkoutExercise>) => void;
  onDragEnd: (result: any) => void;
  onSelectExercise: any;
}

export const ExerciseList = ({
  exercises,
  showExerciseLibrary,
  setShowExerciseLibrary,
  editingExerciseId,
  setEditingExerciseId,
  onDeleteExercise,
  onUpdateExercise,
  onDragEnd,
  onSelectExercise,
}: ExerciseListProps) => {
  return (
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
            <ExerciseLibrary onSelectExercise={onSelectExercise} />
          </DialogContent>
        </Dialog>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md text-muted-foreground">
          No exercises added yet. Click "Add Exercise" to build your workout.
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="exercises">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {exercises.map((exercise, index) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onDelete={onDeleteExercise}
                    onUpdate={onUpdateExercise}
                    onEdit={(id) => {
                      setEditingExerciseId(id);
                      setShowExerciseLibrary(true);
                    }}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editingExerciseId && (
        <Dialog
          open={editingExerciseId !== null && showExerciseLibrary}
          onOpenChange={(open) => {
            setShowExerciseLibrary(open);
            if (!open) setEditingExerciseId(null);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Change Exercise</DialogTitle>
            </DialogHeader>
            <ExerciseLibrary onSelectExercise={onSelectExercise} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
