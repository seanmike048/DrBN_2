export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_routines: {
        Row: {
          check_in_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          product_picks: Json | null
          routine_type: Database["public"]["Enums"]["routine_type"]
          steps: Json
          tools_actions: Json | null
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          check_in_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_picks?: Json | null
          routine_type: Database["public"]["Enums"]["routine_type"]
          steps?: Json
          tools_actions?: Json | null
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          check_in_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_picks?: Json | null
          routine_type?: Database["public"]["Enums"]["routine_type"]
          steps?: Json
          tools_actions?: Json | null
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_routines_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      check_in_photos: {
        Row: {
          check_in_id: string
          created_at: string | null
          id: string
          photo_type: Database["public"]["Enums"]["photo_type"]
          storage_path: string
        }
        Insert: {
          check_in_id: string
          created_at?: string | null
          id?: string
          photo_type: Database["public"]["Enums"]["photo_type"]
          storage_path: string
        }
        Update: {
          check_in_id?: string
          created_at?: string | null
          id?: string
          photo_type?: Database["public"]["Enums"]["photo_type"]
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_photos_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          created_at: string | null
          id: string
          is_baseline: boolean | null
          lighting_quality: number | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          lighting_quality?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          lighting_quality?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          created_at: string | null
          id: string
          logged_date: string
          notes: string | null
          user_id: string
          water_glasses: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logged_date?: string
          notes?: string | null
          user_id: string
          water_glasses?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logged_date?: string
          notes?: string | null
          user_id?: string
          water_glasses?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          allergies: string[] | null
          budget_tier: Database["public"]["Enums"]["budget_tier"] | null
          climate: Database["public"]["Enums"]["climate_type"] | null
          concerns: string[] | null
          country: string | null
          created_at: string | null
          id: string
          is_plus_member: boolean | null
          name: string | null
          onboarding_completed: boolean | null
          preferred_language: string | null
          sensitivity: Database["public"]["Enums"]["sensitivity_level"] | null
          shaving_frequency: string | null
          skin_type: Database["public"]["Enums"]["skin_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_range?: string | null
          allergies?: string[] | null
          budget_tier?: Database["public"]["Enums"]["budget_tier"] | null
          climate?: Database["public"]["Enums"]["climate_type"] | null
          concerns?: string[] | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_plus_member?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          sensitivity?: Database["public"]["Enums"]["sensitivity_level"] | null
          shaving_frequency?: string | null
          skin_type?: Database["public"]["Enums"]["skin_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_range?: string | null
          allergies?: string[] | null
          budget_tier?: Database["public"]["Enums"]["budget_tier"] | null
          climate?: Database["public"]["Enums"]["climate_type"] | null
          concerns?: string[] | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_plus_member?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          sensitivity?: Database["public"]["Enums"]["sensitivity_level"] | null
          shaving_frequency?: string | null
          skin_type?: Database["public"]["Enums"]["skin_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skin_evolution: {
        Row: {
          ai_concerns: string[] | null
          ai_summary: string | null
          barrier_comfort_score: number | null
          check_in_id: string
          created_at: string | null
          id: string
          oiliness_score: number | null
          overall_score: number | null
          texture_score: number | null
          uneven_tone_score: number | null
          user_id: string
        }
        Insert: {
          ai_concerns?: string[] | null
          ai_summary?: string | null
          barrier_comfort_score?: number | null
          check_in_id: string
          created_at?: string | null
          id?: string
          oiliness_score?: number | null
          overall_score?: number | null
          texture_score?: number | null
          uneven_tone_score?: number | null
          user_id: string
        }
        Update: {
          ai_concerns?: string[] | null
          ai_summary?: string | null
          barrier_comfort_score?: number | null
          check_in_id?: string
          created_at?: string | null
          id?: string
          oiliness_score?: number | null
          overall_score?: number | null
          texture_score?: number | null
          uneven_tone_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skin_evolution_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: true
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          id: string
          is_active: boolean | null
          key_ingredients: string[] | null
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_ingredients?: string[] | null
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_ingredients?: string[] | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_chat_session: {
        Args: { target_session_id: string }
        Returns: boolean
      }
      can_access_check_in: {
        Args: { target_check_in_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { target_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      budget_tier: "budget" | "standard" | "premium"
      climate_type: "humid" | "dry" | "cold" | "hot" | "temperate"
      photo_type: "front" | "left_profile" | "right_profile"
      product_category:
        | "cleanser"
        | "serum"
        | "moisturizer"
        | "sunscreen"
        | "exfoliant"
        | "tool"
        | "treatment"
        | "mask"
        | "toner"
        | "oil"
      routine_type: "am" | "midday" | "pm" | "weekly"
      sensitivity_level: "low" | "medium" | "high"
      skin_type: "oily" | "dry" | "combination" | "normal" | "sensitive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      budget_tier: ["budget", "standard", "premium"],
      climate_type: ["humid", "dry", "cold", "hot", "temperate"],
      photo_type: ["front", "left_profile", "right_profile"],
      product_category: [
        "cleanser",
        "serum",
        "moisturizer",
        "sunscreen",
        "exfoliant",
        "tool",
        "treatment",
        "mask",
        "toner",
        "oil",
      ],
      routine_type: ["am", "midday", "pm", "weekly"],
      sensitivity_level: ["low", "medium", "high"],
      skin_type: ["oily", "dry", "combination", "normal", "sensitive"],
    },
  },
} as const
