
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseCategory } from '@/types/workout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  category_id: z.string().optional(),
  description: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof exerciseSchema>;

interface NewExerciseFormProps {
  categories: ExerciseCategory[];
  onExerciseAdded: (exercise: Exercise) => void;
  onCancel: () => void;
}

export const NewExerciseForm = ({ categories, onExerciseAdded, onCancel }: NewExerciseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      video_url: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: values.name,
          category_id: values.category_id ? parseInt(values.category_id) : null,
          description: values.description || null,
          video_url: values.video_url || null,
          is_public: true, // For now, all exercises are public
        })
        .select()
        .single();

      if (error) throw error;
      
      onExerciseAdded(data);
    } catch (error) {
      console.error('Error creating exercise:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Barbell Bench Press" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
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
                  placeholder="Describe the exercise and proper form..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://youtube.com/..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Exercise'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
