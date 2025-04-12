
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

type BodyMetricsFormValues = {
  date: string;
  weight_kg: string;
  body_fat_percent: string;
  chest_cm: string;
  waist_cm: string;
  hip_cm: string;
  notes: string;
};

type BodyMetricsDialogProps = {
  onMetricsAdded: () => void;
};

export const BodyMetricsDialog = ({ onMetricsAdded }: BodyMetricsDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<BodyMetricsFormValues>({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '',
    body_fat_percent: '',
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert form values to numbers where needed
      const metricsData = {
        date: formValues.date,
        weight_kg: formValues.weight_kg ? parseFloat(formValues.weight_kg) : null,
        body_fat_percent: formValues.body_fat_percent ? parseFloat(formValues.body_fat_percent) : null,
        chest_cm: formValues.chest_cm ? parseFloat(formValues.chest_cm) : null,
        waist_cm: formValues.waist_cm ? parseFloat(formValues.waist_cm) : null,
        hip_cm: formValues.hip_cm ? parseFloat(formValues.hip_cm) : null,
        notes: formValues.notes || null
      };

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log("Saving body metrics for user:", user.id);
      console.log("Metrics data:", metricsData);

      // Save to database
      const { error } = await supabase
        .from('body_metrics')
        .insert([
          {
            ...metricsData,
            client_id: user.id
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Success message
      toast({
        title: "Metrics saved",
        description: "Your body metrics have been recorded successfully."
      });

      // Close dialog and refresh data
      setOpen(false);
      onMetricsAdded();

      // Reset form
      setFormValues({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight_kg: '',
        body_fat_percent: '',
        chest_cm: '',
        waist_cm: '',
        hip_cm: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast({
        title: "Error",
        description: "Failed to save your metrics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Body Metrics</DialogTitle>
            <DialogDescription>
              Record your current body measurements to track your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formValues.date}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight_kg" className="text-right">
                Weight (kg)
              </Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.1"
                placeholder="e.g. 70.5"
                value={formValues.weight_kg}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="body_fat_percent" className="text-right">
                Body Fat (%)
              </Label>
              <Input
                id="body_fat_percent"
                name="body_fat_percent"
                type="number"
                step="0.1"
                placeholder="e.g. 15.5"
                value={formValues.body_fat_percent}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chest_cm" className="text-right">
                Chest (cm)
              </Label>
              <Input
                id="chest_cm"
                name="chest_cm"
                type="number"
                step="0.1"
                placeholder="e.g. 95.0"
                value={formValues.chest_cm}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="waist_cm" className="text-right">
                Waist (cm)
              </Label>
              <Input
                id="waist_cm"
                name="waist_cm"
                type="number"
                step="0.1"
                placeholder="e.g. 80.0"
                value={formValues.waist_cm}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hip_cm" className="text-right">
                Hip (cm)
              </Label>
              <Input
                id="hip_cm"
                name="hip_cm"
                type="number"
                step="0.1"
                placeholder="e.g. 90.0"
                value={formValues.hip_cm}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Optional notes"
                value={formValues.notes}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save metrics'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
