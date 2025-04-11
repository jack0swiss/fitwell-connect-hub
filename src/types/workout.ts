
export type ExerciseCategory = {
  id: number;
  name: string;
};

export type Exercise = {
  id: number;
  name: string;
  category_id: number | null;
  description: string | null;
  video_url: string | null;
  is_public: boolean;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string | null;
  coach_id: string;
  created_at: string;
  updated_at: string;
};

export type Workout = {
  id: string;
  plan_id: string | null;
  name: string;
  day_of_week: number | null;
  description: string | null;
  created_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string | null;
  exercise_id: number | null;
  sets: number;
  reps: number | null;
  weight: number | null;
  rest_time: number | null;
  notes: string | null;
  order_index: number;
  is_superset: boolean | null;
  superset_group: number | null;
  exercise?: Exercise;
};

export type WorkoutAssignment = {
  id: string;
  plan_id: string | null;
  client_id: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type WorkoutLog = {
  id: string;
  client_id: string | null;
  workout_id: string | null;
  date: string;
  notes: string | null;
  completed: boolean | null;
  created_at: string;
  workout?: Workout;
};

export type ExerciseLog = {
  id: string;
  workout_log_id: string | null;
  exercise_id: number | null;
  set_number: number;
  reps: number | null;
  weight: number | null;
  notes: string | null;
  created_at: string;
  exercise?: Exercise;
};

export const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
