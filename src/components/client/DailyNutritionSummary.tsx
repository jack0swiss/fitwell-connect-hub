
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircularProgressChart } from './CircularProgressChart';
import { NutritionPlan, DailyNutritionTotals } from '@/types/nutrition';
import { Utensils, Droplets } from 'lucide-react';

interface DailyNutritionSummaryProps {
  totals: DailyNutritionTotals | null;
  plan: NutritionPlan | null;
}

export const DailyNutritionSummary = ({ totals, plan }: DailyNutritionSummaryProps) => {
  if (!totals) {
    totals = {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      total_water_ml: 0
    };
  }

  // Default values if no plan exists
  const calorieTarget = plan?.daily_calorie_target || 2000;
  const carbsPct = plan?.macro_carbs_pct || 40;
  const proteinPct = plan?.macro_protein_pct || 30;
  const fatPct = plan?.macro_fat_pct || 30;
  
  // Calculate ratios for progress bars
  const calorieRatio = Math.min(Math.round((totals.total_calories / calorieTarget) * 100), 100);
  
  // Calculate actual macros percentages if any food has been logged
  const totalMacroGrams = totals.total_carbs + totals.total_protein + totals.total_fat;
  const actualCarbsPct = totalMacroGrams > 0 ? Math.round((totals.total_carbs / totalMacroGrams) * 100) : 0;
  const actualProteinPct = totalMacroGrams > 0 ? Math.round((totals.total_protein / totalMacroGrams) * 100) : 0;
  const actualFatPct = totalMacroGrams > 0 ? Math.round((totals.total_fat / totalMacroGrams) * 100) : 0;
  
  // Water tracking (assuming 2.5L or 2500ml is the daily target)
  const waterTarget = 2500;
  const waterRatio = Math.min(Math.round((totals.total_water_ml / waterTarget) * 100), 100);

  return (
    <Card className="fitness-card">
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <CircularProgressChart 
                percentage={calorieRatio} 
                size={120}
                strokeWidth={8}
                label={`${totals.total_calories}`}
                sublabel="kcal"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">of {calorieTarget} kcal goal</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-5 justify-center">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Carbs ({actualCarbsPct}%)</span>
                <span className="text-muted-foreground">{totals.total_carbs}g / {carbsPct}%</span>
              </div>
              <div className="flex items-center">
                <Progress value={actualCarbsPct} max={100} className="h-2 bg-muted" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Protein ({actualProteinPct}%)</span>
                <span className="text-muted-foreground">{totals.total_protein}g / {proteinPct}%</span>
              </div>
              <div className="flex items-center">
                <Progress value={actualProteinPct} max={100} className="h-2 bg-muted" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fat ({actualFatPct}%)</span>
                <span className="text-muted-foreground">{totals.total_fat}g / {fatPct}%</span>
              </div>
              <div className="flex items-center">
                <Progress value={actualFatPct} max={100} className="h-2 bg-muted" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm mb-1">
            <div className="flex items-center">
              <Droplets className="h-4 w-4 mr-1 text-blue-400" />
              <span>Water</span>
            </div>
            <span className="text-muted-foreground">{totals.total_water_ml}ml / {waterTarget}ml</span>
          </div>
          <Progress value={waterRatio} max={100} className="h-2 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};
