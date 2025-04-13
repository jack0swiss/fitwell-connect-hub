
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { weekDays } from '@/types/workout';
import { WorkoutFormValues } from './useWorkoutBuilder';
import { UseFormReturn } from 'react-hook-form';

interface WorkoutFormProps {
  form: UseFormReturn<WorkoutFormValues>;
  onBack: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
  children: React.ReactNode;
}

export const WorkoutForm = ({ 
  form, 
  onBack, 
  isSubmitting, 
  isEditing,
  children
}: WorkoutFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit} className="space-y-4">
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

        {children}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Workout' : 'Create Workout'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <Button 
    variant="ghost" 
    className="flex items-center text-sm h-8 mb-2"
    onClick={onClick}
  >
    <ArrowLeft className="h-4 w-4 mr-1" /> Back to workouts
  </Button>
);
