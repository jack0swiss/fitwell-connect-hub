
import { WorkoutExercise } from '@/types/workout';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorkoutExercise>) => void;
  onEdit: (id: string) => void;
}

export const ExerciseItem = ({ 
  exercise, 
  index, 
  onDelete, 
  onUpdate, 
  onEdit 
}: ExerciseItemProps) => {
  return (
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(exercise.id)}
              >
                <Edit size={16} />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(exercise.id)}
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
                onChange={(e) => onUpdate(exercise.id, { sets: parseInt(e.target.value) || 1 })}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reps</label>
              <Input
                type="number"
                value={exercise.reps || ''}
                min={0}
                onChange={(e) => onUpdate(exercise.id, { reps: e.target.value ? parseInt(e.target.value) : null })}
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
                onChange={(e) => onUpdate(exercise.id, { weight: e.target.value ? parseFloat(e.target.value) : null })}
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
                onChange={(e) => onUpdate(exercise.id, { rest_time: e.target.value ? parseInt(e.target.value) : null })}
                className="h-8 mt-1"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs text-muted-foreground">Notes</label>
            <Textarea
              value={exercise.notes || ''}
              placeholder="Notes for this exercise..."
              onChange={(e) => onUpdate(exercise.id, { notes: e.target.value || null })}
              className="min-h-[60px] mt-1"
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};
