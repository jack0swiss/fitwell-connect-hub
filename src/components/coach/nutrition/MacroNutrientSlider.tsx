
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface MacroNutrientSliderProps {
  type: 'carbs' | 'protein' | 'fat';
  value: number;
  onChange: (type: 'carbs' | 'protein' | 'fat', value: number) => void;
  label: string;
}

const MacroNutrientSlider = ({ type, value, onChange, label }: MacroNutrientSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor={`${type}-pct`}>{label}</Label>
        <span>{value}%</span>
      </div>
      <Slider
        id={`${type}-pct`}
        min={10}
        max={70}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(type, values[0])}
      />
    </div>
  );
};

export default MacroNutrientSlider;
