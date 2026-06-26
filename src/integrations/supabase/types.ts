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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          category: string | null
          created_at: string
          description: string
          effort: string | null
          id: string
          impact_notes: string | null
          implemented_at: string | null
          month: string | null
          priority: string
          projected_co2_kg_per_month: number | null
          projected_saving_kwh_per_day: number | null
          rec_key: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          effort?: string | null
          id?: string
          impact_notes?: string | null
          implemented_at?: string | null
          month?: string | null
          priority?: string
          projected_co2_kg_per_month?: number | null
          projected_saving_kwh_per_day?: number | null
          rec_key?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          effort?: string | null
          id?: string
          impact_notes?: string | null
          implemented_at?: string | null
          month?: string | null
          priority?: string
          projected_co2_kg_per_month?: number | null
          projected_saving_kwh_per_day?: number | null
          rec_key?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          node: string | null
          recommendation: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
          user_id: string
          waste_kwh_per_day: number | null
          waste_uzs_per_day: number | null
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          node?: string | null
          recommendation?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          user_id: string
          waste_kwh_per_day?: number | null
          waste_uzs_per_day?: number | null
          zone: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          node?: string | null
          recommendation?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          user_id?: string
          waste_kwh_per_day?: number | null
          waste_uzs_per_day?: number | null
          zone?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_records: {
        Row: {
          bill_uzs: number | null
          created_at: string
          grid_consumed_kwh: number | null
          id: string
          month: string
          school_days: number | null
          solar_generated_kwh: number | null
          user_id: string
        }
        Insert: {
          bill_uzs?: number | null
          created_at?: string
          grid_consumed_kwh?: number | null
          id?: string
          month: string
          school_days?: number | null
          solar_generated_kwh?: number | null
          user_id: string
        }
        Update: {
          bill_uzs?: number | null
          created_at?: string
          grid_consumed_kwh?: number | null
          id?: string
          month?: string
          school_days?: number | null
          solar_generated_kwh?: number | null
          user_id?: string
        }
        Relationships: []
      }
      school_profiles: {
        Row: {
          alert_threshold_kwh: number | null
          city: string | null
          created_at: string | null
          floors: number | null
          id: string
          operating_hours: string | null
          panel_area_m2: number | null
          school_name: string | null
          school_type: string | null
          solar_capacity_kw: number | null
          tariff_uzs_per_kwh: number | null
          total_rooms: number | null
          user_id: string
        }
        Insert: {
          alert_threshold_kwh?: number | null
          city?: string | null
          created_at?: string | null
          floors?: number | null
          id?: string
          operating_hours?: string | null
          panel_area_m2?: number | null
          school_name?: string | null
          school_type?: string | null
          solar_capacity_kw?: number | null
          tariff_uzs_per_kwh?: number | null
          total_rooms?: number | null
          user_id: string
        }
        Update: {
          alert_threshold_kwh?: number | null
          city?: string | null
          created_at?: string | null
          floors?: number | null
          id?: string
          operating_hours?: string | null
          panel_area_m2?: number | null
          school_name?: string | null
          school_type?: string | null
          solar_capacity_kw?: number | null
          tariff_uzs_per_kwh?: number | null
          total_rooms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          created_at: string
          current_kw: number | null
          id: string
          name: string
          user_id: string
          zone_type: string
        }
        Insert: {
          created_at?: string
          current_kw?: number | null
          id?: string
          name: string
          user_id: string
          zone_type?: string
        }
        Update: {
          created_at?: string
          current_kw?: number | null
          id?: string
          name?: string
          user_id?: string
          zone_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
