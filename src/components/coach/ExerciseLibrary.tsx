
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseCategory } from '@/types/workout';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewExerciseForm } from './NewExerciseForm';
import { toast } from '@/components/ui/use-toast';

interface ExerciseLibraryProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export const ExerciseLibrary = ({ onSelectExercise }: ExerciseLibraryProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showNewExerciseDialog, setShowNewExerciseDialog] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('exercise_categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);
        
        // Fetch exercises
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercise library',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleExerciseAdded = (newExercise: Exercise) => {
    setExercises([...exercises, newExercise]);
    setShowNewExerciseDialog(false);
    toast({
      title: 'Success',
      description: 'Exercise added to library',
    });
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || exercise.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={showNewExerciseDialog} onOpenChange={setShowNewExerciseDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
            </DialogHeader>
            <NewExerciseForm 
              categories={categories} 
              onExerciseAdded={handleExerciseAdded} 
              onCancel={() => setShowNewExerciseDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="whitespace-nowrap"
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="whitespace-nowrap"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No exercises found. Try adjusting your search or category filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredExercises.map(exercise => (
            <Card 
              key={exercise.id} 
              className="fitness-card hover:bg-card/90 transition-colors cursor-pointer"
              onClick={() => onSelectExercise(exercise)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-fitwell-purple-dark rounded-full p-2 flex-shrink-0">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {categories.find(c => c.id === exercise.category_id)?.name || 'Uncategorized'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
