
import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AddWaterLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  onAddSuccess: () => void;
}

export const AddWaterLogDialog = ({ 
  open, 
  onOpenChange, 
  date,
  onAddSuccess 
}: AddWaterLogDialogProps) => {
  const [amount, setAmount] = useState('250');
  const [submitting, setSubmitting] = useState(false);
  
  const quickAmounts = [100, 250, 330, 500, 750];
  
  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid water amount',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log("Logging water for user:", user.id);
      console.log("Water data:", { date, amount_ml: parseInt(amount) });
      
      const { error } = await supabase
        .from('water_logs')
        .insert({
          date,
          amount_ml: parseInt(amount),
          client_id: user.id
        });
        
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      toast({
        title: 'Water logged',
        description: 'Your water intake has been recorded'
      });
      
      onOpenChange(false);
      onAddSuccess();
    } catch (error) {
      console.error('Error adding water log:', error);
      toast({
        title: 'Error',
        description: 'Failed to record water intake',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Water Intake</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (ml)
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                className="mb-2"
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((amt) => (
                  <Button 
                    key={amt} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1"
                  >
                    {amt} ml
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Log Water'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
