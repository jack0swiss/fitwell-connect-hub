
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NutritionPlanHeaderProps {
  isNewPlan: boolean;
  saving: boolean;
  onSave: () => void;
}

const NutritionPlanHeader = ({ isNewPlan, saving, onSave }: NutritionPlanHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{isNewPlan ? 'New Nutrition Plan' : 'Edit Nutrition Plan'}</h1>
      <Button
        onClick={onSave}
        disabled={saving}
        className="flex items-center"
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Plan'}
      </Button>
    </header>
  );
};

export default NutritionPlanHeader;
