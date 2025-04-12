
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const FormActions = ({ onCancel, isSubmitting, isEditing }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Plan' : 'Create Plan'}
          </>
        )}
      </Button>
    </div>
  );
};
