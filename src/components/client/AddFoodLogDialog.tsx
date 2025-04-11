
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FoodItem, mealTypes } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AddFoodLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  onAddSuccess: () => void;
}

export const AddFoodLogDialog = ({ 
  open, 
  onOpenChange, 
  date,
  onAddSuccess 
}: AddFoodLogDialogProps) => {
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customFood, setCustomFood] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Form state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [mealType, setMealType] = useState(mealTypes[0]);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  
  // Load food database when dialog opens
  useEffect(() => {
    if (open) {
      fetchFoodDatabase();
    }
  }, [open]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
  // Update form values when food is selected
  useEffect(() => {
    if (selectedFood) {
      setFoodName(selectedFood.name);
      setCalories(String(Math.round(selectedFood.calories_per_100g)));
      setProtein(selectedFood.protein_g_per_100g ? String(selectedFood.protein_g_per_100g) : '');
      setCarbs(selectedFood.carbs_g_per_100g ? String(selectedFood.carbs_g_per_100g) : '');
      setFat(selectedFood.fat_g_per_100g ? String(selectedFood.fat_g_per_100g) : '');
    }
  }, [selectedFood]);
  
  const fetchFoodDatabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setFoodDatabase(data || []);
    } catch (error) {
      console.error('Error fetching food database:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedFood(null);
    setMealType(mealTypes[0]);
    setFoodName('');
    setQuantity('100');
    setUnit('g');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    setCustomFood(true);
  };
  
  const calculateNutrients = () => {
    if (selectedFood && quantity) {
      const ratio = parseFloat(quantity) / 100;
      setCalories(String(Math.round(selectedFood.calories_per_100g * ratio)));
      
      if (selectedFood.protein_g_per_100g) {
        setProtein(String(Math.round(selectedFood.protein_g_per_100g * ratio)));
      }
      
      if (selectedFood.carbs_g_per_100g) {
        setCarbs(String(Math.round(selectedFood.carbs_g_per_100g * ratio)));
      }
      
      if (selectedFood.fat_g_per_100g) {
        setFat(String(Math.round(selectedFood.fat_g_per_100g * ratio)));
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!foodName || !calories) {
      toast({
        title: 'Missing information',
        description: 'Please enter at least a food name and calories',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('nutrition_logs')
        .insert({
          date,
          meal_type: mealType,
          food_name: foodName,
          quantity: quantity ? parseFloat(quantity) : null,
          unit,
          calories: parseInt(calories),
          protein_g: protein ? parseInt(protein) : null,
          carbs_g: carbs ? parseInt(carbs) : null,
          fat_g: fat ? parseInt(fat) : null,
          notes: notes || null
        });
        
      if (error) throw error;
      
      toast({
        title: 'Food logged',
        description: 'Your food entry has been added to your log'
      });
      
      onOpenChange(false);
      onAddSuccess();
    } catch (error) {
      console.error('Error adding food log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add food entry',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSelectFood = (item: FoodItem) => {
    setSelectedFood(item);
    setCustomFood(false);
    setSearchOpen(false);
  };
  
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (selectedFood && value) {
      calculateNutrients();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food Entry</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal-type" className="text-right">
              Meal
            </Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="meal-type" className="col-span-3">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Food
            </Label>
            <div className="col-span-3">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-full justify-between"
                    onClick={() => setSearchOpen(!searchOpen)}
                    disabled={loading}
                  >
                    {customFood 
                      ? 'Search or add custom food' 
                      : selectedFood?.name}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search food database..." />
                    <CommandList>
                      <CommandEmpty>No foods found.</CommandEmpty>
                      {foodDatabase.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => handleSelectFood(item)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedFood?.id === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>{item.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {item.calories_per_100g} kcal/100g
                          </span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {customFood && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="food-name" className="text-right">
                Name
              </Label>
              <Input
                id="food-name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                type="number"
                className="flex-1"
              />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="serving">serving</SelectItem>
                  <SelectItem value="piece">piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calories" className="text-right">
              Calories
            </Label>
            <Input
              id="calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              type="number"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Macros (g)
            </Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="protein" className="text-xs text-muted-foreground">
                  Protein
                </Label>
                <Input
                  id="protein"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="carbs" className="text-xs text-muted-foreground">
                  Carbs
                </Label>
                <Input
                  id="carbs"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="fat" className="text-xs text-muted-foreground">
                  Fat
                </Label>
                <Input
                  id="fat"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  type="number"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              rows={2}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
