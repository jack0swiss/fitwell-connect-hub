export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      body_metrics: {
        Row: {
          body_fat_percent: number | null
          chest_cm: number | null
          client_id: string | null
          created_at: string
          date: string
          hip_cm: number | null
          id: string
          notes: string | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          body_fat_percent?: number | null
          chest_cm?: number | null
          client_id?: string | null
          created_at?: string
          date?: string
          hip_cm?: number | null
          id?: string
          notes?: string | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_fat_percent?: number | null
          chest_cm?: number | null
          client_id?: string | null
          created_at?: string
          date?: string
          hip_cm?: number | null
          id?: string
          notes?: string | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      exercise_categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string
          exercise_id: number | null
          id: string
          notes: string | null
          reps: number | null
          set_number: number
          weight: number | null
          workout_log_id: string | null
        }
        Insert: {
          created_at?: string
          exercise_id?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          set_number: number
          weight?: number | null
          workout_log_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          set_number?: number
          weight?: number | null
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category_id: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          is_public: boolean | null
          name: string
          video_url: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          name: string
          video_url?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          is_public?: boolean | null
          name?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_goals: {
        Row: {
          achievement_date: string | null
          client_id: string | null
          coach_id: string | null
          created_at: string
          goal_type: string
          id: string
          is_achieved: boolean | null
          notes: string | null
          start_date: string
          start_value: number | null
          target_date: string | null
          target_value: number
          updated_at: string
        }
        Insert: {
          achievement_date?: string | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          goal_type: string
          id?: string
          is_achieved?: boolean | null
          notes?: string | null
          start_date?: string
          start_value?: number | null
          target_date?: string | null
          target_value: number
          updated_at?: string
        }
        Update: {
          achievement_date?: string | null
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          goal_type?: string
          id?: string
          is_achieved?: boolean | null
          notes?: string | null
          start_date?: string
          start_value?: number | null
          target_date?: string | null
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      food_database: {
        Row: {
          calories_per_100g: number
          carbs_g_per_100g: number | null
          created_at: string
          created_by: string | null
          fat_g_per_100g: number | null
          id: string
          is_public: boolean | null
          name: string
          protein_g_per_100g: number | null
        }
        Insert: {
          calories_per_100g: number
          carbs_g_per_100g?: number | null
          created_at?: string
          created_by?: string | null
          fat_g_per_100g?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          protein_g_per_100g?: number | null
        }
        Update: {
          calories_per_100g?: number
          carbs_g_per_100g?: number | null
          created_at?: string
          created_by?: string | null
          fat_g_per_100g?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          protein_g_per_100g?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number
          carbs_g: number | null
          client_id: string | null
          created_at: string
          date: string
          fat_g: number | null
          food_name: string
          id: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          calories: number
          carbs_g?: number | null
          client_id?: string | null
          created_at?: string
          date?: string
          fat_g?: number | null
          food_name: string
          id?: string
          meal_type: string
          notes?: string | null
          protein_g?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          calories?: number
          carbs_g?: number | null
          client_id?: string | null
          created_at?: string
          date?: string
          fat_g?: number | null
          food_name?: string
          id?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          client_id: string | null
          coach_id: string | null
          created_at: string
          daily_calorie_target: number | null
          id: string
          macro_carbs_pct: number | null
          macro_fat_pct: number | null
          macro_protein_pct: number | null
          plan_notes: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          daily_calorie_target?: number | null
          id?: string
          macro_carbs_pct?: number | null
          macro_fat_pct?: number | null
          macro_protein_pct?: number | null
          plan_notes?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          created_at?: string
          daily_calorie_target?: number | null
          id?: string
          macro_carbs_pct?: number | null
          macro_fat_pct?: number | null
          macro_protein_pct?: number | null
          plan_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      personal_bests: {
        Row: {
          client_id: string | null
          created_at: string
          date: string
          exercise_id: number | null
          id: string
          reps: number | null
          weight: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date?: string
          exercise_id?: number | null
          id?: string
          reps?: number | null
          weight?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date?: string
          exercise_id?: number | null
          id?: string
          reps?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_bests_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          category: string
          client_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          photo_url: string
        }
        Insert: {
          category: string
          client_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_url: string
        }
        Update: {
          category?: string
          client_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_url?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          client_id: string | null
          created_at: string
          date: string
          id: string
        }
        Insert: {
          amount_ml: number
          client_id?: string | null
          created_at?: string
          date?: string
          id?: string
        }
        Update: {
          amount_ml?: number
          client_id?: string | null
          created_at?: string
          date?: string
          id?: string
        }
        Relationships: []
      }
      workout_assignments: {
        Row: {
          client_id: string | null
          created_at: string
          end_date: string | null
          id: string
          plan_id: string | null
          start_date: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          exercise_id: number | null
          id: string
          is_superset: boolean | null
          notes: string | null
          order_index: number
          reps: number | null
          rest_time: number | null
          sets: number
          superset_group: number | null
          weight: number | null
          workout_id: string | null
        }
        Insert: {
          exercise_id?: number | null
          id?: string
          is_superset?: boolean | null
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_time?: number | null
          sets: number
          superset_group?: number | null
          weight?: number | null
          workout_id?: string | null
        }
        Update: {
          exercise_id?: number | null
          id?: string
          is_superset?: boolean | null
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_time?: number | null
          sets?: number
          superset_group?: number | null
          weight?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          client_id: string | null
          completed: boolean | null
          created_at: string
          date: string
          id: string
          notes: string | null
          workout_id: string | null
        }
        Insert: {
          client_id?: string | null
          completed?: boolean | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          workout_id?: string | null
        }
        Update: {
          client_id?: string | null
          completed?: boolean | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          day_of_week: number | null
          description: string | null
          id: string
          name: string
          plan_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          name: string
          plan_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          name?: string
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      exercise_progression: {
        Row: {
          best_set_number: number | null
          client_id: string | null
          date: string | null
          exercise_id: number | null
          exercise_name: string | null
          max_reps: number | null
          max_weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      unread_message_counts: {
        Row: {
          from_user_id: string | null
          unread_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_daily_nutrition_totals: {
        Args: Record<PropertyKey, never> | { user_id: string; log_date: string }
        Returns: {
          total_calories: number
          total_protein: number
          total_fats: number
          total_carbohydrates: number
        }[]
      }
      get_nutrition_adherence: {
        Args: { user_id: string; start_date: string; end_date: string }
        Returns: {
          avg_daily_calories: number
          target_calories: number
          calorie_adherence_percentage: number
        }[]
      }
      get_workout_adherence: {
        Args:
          | Record<PropertyKey, never>
          | { user_id?: string; start_date?: string; end_date?: string }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: Record<PropertyKey, never> | { p_conversation_partner_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
