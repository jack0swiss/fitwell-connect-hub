
export type NutritionPlan = {
  id: string;
  client_id: string | null;
  coach_id: string | null;
  daily_calorie_target: number | null;
  macro_carbs_pct: number | null;
  macro_protein_pct: number | null;
  macro_fat_pct: number | null;
  plan_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NutritionLog = {
  id: string;
  client_id: string | null;
  date: string;
  meal_type: string;
  food_name: string;
  quantity: number | null;
  unit: string | null;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
  notes: string | null;
};

export type WaterLog = {
  id: string;
  client_id: string | null;
  date: string;
  amount_ml: number;
  created_at: string;
};

export type FoodItem = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_g_per_100g: number | null;
  carbs_g_per_100g: number | null;
  fat_g_per_100g: number | null;
  is_public: boolean | null;
  created_by: string | null;
  created_at: string;
};

export type DailyNutritionTotals = {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_water_ml: number;
};

export type BodyMetric = {
  id: string;
  client_id: string | null;
  date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  notes: string | null;
  created_at: string;
};

export type NutritionAdherence = {
  avg_daily_calories: number;
  target_calories: number;
  calorie_adherence_percentage: number;
};

export type WorkoutAdherence = {
  completed_workouts: number;
  planned_workouts: number;
  adherence_percentage: number;
};

export const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export type NutritionTotals = {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_water_ml: number;
};

export type DailyCalorie = {
  date: string;
  calories: number;
};

export type ClientNutritionData = {
  totals: NutritionTotals;
  dailyCalories: DailyCalorie[];
};
