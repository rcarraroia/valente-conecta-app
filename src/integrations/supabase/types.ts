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
      ambassador_links: {
        Row: {
          ambassador_user_id: string
          campaign_id: string | null
          created_at: string
          generated_url: string
          id: string
          short_url: string | null
          status: string
        }
        Insert: {
          ambassador_user_id: string
          campaign_id?: string | null
          created_at?: string
          generated_url: string
          id?: string
          short_url?: string | null
          status?: string
        }
        Update: {
          ambassador_user_id?: string
          campaign_id?: string | null
          created_at?: string
          generated_url?: string
          id?: string
          short_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_performance: {
        Row: {
          ambassador_user_id: string
          created_at: string
          current_level: string
          id: string
          last_updated_at: string
          points: number
          total_clicks: number
          total_donations_amount: number
          total_donations_count: number
        }
        Insert: {
          ambassador_user_id: string
          created_at?: string
          current_level?: string
          id?: string
          last_updated_at?: string
          points?: number
          total_clicks?: number
          total_donations_amount?: number
          total_donations_count?: number
        }
        Update: {
          ambassador_user_id?: string
          created_at?: string
          current_level?: string
          id?: string
          last_updated_at?: string
          points?: number
          total_clicks?: number
          total_donations_amount?: number
          total_donations_count?: number
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string | null
          id: string
          notes: string | null
          partner_id: string
          schedule_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string | null
          id?: string
          notes?: string | null
          partner_id: string
          schedule_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          partner_id?: string
          schedule_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          goal_amount: number | null
          id: string
          is_active: boolean
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      diagnostics: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          recommendations: string | null
          severity_level: number | null
          status: string | null
          symptoms: string
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          recommendations?: string | null
          severity_level?: number | null
          status?: string | null
          symptoms: string
          user_id: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          recommendations?: string | null
          severity_level?: number | null
          status?: string | null
          symptoms?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          ambassador_link_id: string | null
          amount: number
          currency: string
          donated_at: string
          donor_email: string | null
          donor_name: string | null
          id: string
          payment_method: string | null
          status: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          ambassador_link_id?: string | null
          amount: number
          currency?: string
          donated_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          ambassador_link_id?: string | null
          amount?: number
          currency?: string
          donated_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_ambassador_link_id_fkey"
            columns: ["ambassador_link_id"]
            isOneToOne: false
            referencedRelation: "ambassador_links"
            referencedColumns: ["id"]
          },
        ]
      }
      library_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          order_position: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_position?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_position?: number
        }
        Relationships: []
      }
      library_resources: {
        Row: {
          author: string | null
          category_id: string | null
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          published_at: string
          resource_type: string
          summary: string | null
          thumbnail_url: string | null
          title: string
          views: number
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          published_at?: string
          resource_type: string
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          views?: number
        }
        Update: {
          author?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          published_at?: string
          resource_type?: string
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "library_resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "library_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          clicked_at: string
          id: string
          ip_address: unknown | null
          link_id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          ip_address?: unknown | null
          link_id: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          ip_address?: unknown | null
          link_id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "ambassador_links"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          category: string | null
          content: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string
          summary: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          summary?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string
          summary?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: []
      }
      onboarding_screens: {
        Row: {
          animation_asset_name: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean
          order_position: number
          title: string
        }
        Insert: {
          animation_asset_name?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_position: number
          title: string
        }
        Update: {
          animation_asset_name?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_position?: number
          title?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          crm_crp_register: string | null
          full_name: string
          id: string
          is_active: boolean | null
          professional_photo_url: string | null
          specialties: Json | null
          specialty: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          crm_crp_register?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          professional_photo_url?: string | null
          specialties?: Json | null
          specialty?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          crm_crp_register?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          professional_photo_url?: string | null
          specialties?: Json | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pre_diagnosis_questions: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          next_question_logic: Json | null
          options: Json | null
          order_position: number
          question_text: string
          question_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          next_question_logic?: Json | null
          options?: Json | null
          order_position: number
          question_text: string
          question_type: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          next_question_logic?: Json | null
          options?: Json | null
          order_position?: number
          question_text?: string
          question_type?: string
        }
        Relationships: []
      }
      pre_diagnosis_sessions: {
        Row: {
          answered_questions: number | null
          diagnosis_result: Json | null
          finished_at: string | null
          id: string
          notes: string | null
          session_status: string
          started_at: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          answered_questions?: number | null
          diagnosis_result?: Json | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          session_status?: string
          started_at?: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          answered_questions?: number | null
          diagnosis_result?: Json | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          session_status?: string
          started_at?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ambassador_code: string | null
          ambassador_opt_in_at: string | null
          ambassador_wallet_id: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_volunteer: boolean | null
          medical_conditions: string | null
          medications: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          ambassador_code?: string | null
          ambassador_opt_in_at?: string | null
          ambassador_wallet_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_volunteer?: boolean | null
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          ambassador_code?: string | null
          ambassador_opt_in_at?: string | null
          ambassador_wallet_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_volunteer?: boolean | null
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          is_available: boolean | null
          max_appointments: number | null
          partner_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          is_available?: boolean | null
          max_appointments?: number | null
          partner_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_appointments?: number | null
          partner_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          contact_info: string | null
          created_at: string
          description: string
          detailed_description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          order_position: number
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          description: string
          detailed_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          order_position?: number
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          description?: string
          detailed_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          order_position?: number
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          application_date: string
          area_of_interest: string | null
          availability: string | null
          experience: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          application_date?: string
          area_of_interest?: string | null
          availability?: string | null
          experience?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          application_date?: string
          area_of_interest?: string | null
          availability?: string | null
          experience?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_ambassador: {
        Args: { user_id: string }
        Returns: boolean
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
