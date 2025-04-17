
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MacroNutrientSlider from './MacroNutrientSlider';
import { NutritionPlanFormData } from '@/hooks/useNutritionPlan';

interface NutritionPlanFormCardProps {
  clientName: string;
  formData: NutritionPlanFormData;
  updateFormField: <K extends keyof NutritionPlanFormData>(
    field: K,
    value: NutritionPlanFormData[K]
  ) => void;
  handleMacroChange: (type: 'carbs' | 'protein' | 'fat', value: number) => void;
}

const NutritionPlanFormCard = ({
  clientName,
  formData,
  updateFormField,
  handleMacroChange
}: NutritionPlanFormCardProps) => {
  const { calorieTarget, carbsPct, proteinPct, fatPct, notes } = formData;
  
  return (
    <Card className="fitness-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Client: {clientName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calorie-target">Daily Calorie Target</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="calorie-target"
              type="number"
              value={calorieTarget}
              onChange={(e) => updateFormField('calorieTarget', parseInt(e.target.value) || 0)}
              className="w-24"
            />
            <span>kcal</span>
          </div>
        </div>
        
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-medium">Macronutrient Distribution</h3>
          
          <div className="space-y-5">
            <MacroNutrientSlider
              type="carbs"
              value={carbsPct}
              onChange={handleMacroChange}
              label="Carbohydrates"
            />
            
            <MacroNutrientSlider
              type="protein"
              value={proteinPct}
              onChange={handleMacroChange}
              label="Protein"
            />
            
            <MacroNutrientSlider
              type="fat"
              value={fatPct}
              onChange={handleMacroChange}
              label="Fat"
            />
          </div>
          
          <div className="flex justify-between py-2 border-t border-border/50 mt-2">
            <span>Total</span>
            <span>{carbsPct + proteinPct + fatPct}%</span>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <Label htmlFor="plan-notes">Plan Notes</Label>
          <Textarea
            id="plan-notes"
            placeholder="Add meal recommendations, dietary restrictions, and other notes..."
            value={notes}
            onChange={(e) => updateFormField('notes', e.target.value)}
            rows={5}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionPlanFormCard;
