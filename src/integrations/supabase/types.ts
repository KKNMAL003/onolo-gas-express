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
      delivery_time_slots: {
        Row: {
          active: boolean | null
          created_at: string
          current_orders: number
          date: string
          id: string
          max_orders: number
          time_window: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          current_orders?: number
          date: string
          id?: string
          max_orders?: number
          time_window: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          current_orders?: number
          date?: string
          id?: string
          max_orders?: number
          time_window?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          auto_status_enabled: boolean | null
          created_at: string
          customer_email: string
          customer_name: string
          delivery_address: string
          delivery_cost: number | null
          delivery_date: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_phone: string
          delivery_zone: string | null
          driver_id: string | null
          estimated_delivery_end: string | null
          estimated_delivery_start: string | null
          id: string
          notes: string | null
          payment_confirmation_sent: boolean | null
          payment_method: string
          preferred_delivery_window: string | null
          priority_level: string | null
          receipt_sent: boolean | null
          service_area_validated: boolean | null
          status: string
          total_amount: number
          tracking_notes: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          auto_status_enabled?: boolean | null
          created_at?: string
          customer_email: string
          customer_name: string
          delivery_address: string
          delivery_cost?: number | null
          delivery_date?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_phone: string
          delivery_zone?: string | null
          driver_id?: string | null
          estimated_delivery_end?: string | null
          estimated_delivery_start?: string | null
          id?: string
          notes?: string | null
          payment_confirmation_sent?: boolean | null
          payment_method: string
          preferred_delivery_window?: string | null
          priority_level?: string | null
          receipt_sent?: boolean | null
          service_area_validated?: boolean | null
          status?: string
          total_amount: number
          tracking_notes?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          auto_status_enabled?: boolean | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          delivery_address?: string
          delivery_cost?: number | null
          delivery_date?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_phone?: string
          delivery_zone?: string | null
          driver_id?: string | null
          estimated_delivery_end?: string | null
          estimated_delivery_start?: string | null
          id?: string
          notes?: string | null
          payment_confirmation_sent?: boolean | null
          payment_method?: string
          preferred_delivery_window?: string | null
          priority_level?: string | null
          receipt_sent?: boolean | null
          service_area_validated?: boolean | null
          status?: string
          total_amount?: number
          tracking_notes?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          default_delivery_window: string | null
          default_latitude: number | null
          default_longitude: number | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          default_delivery_window?: string | null
          default_latitude?: number | null
          default_longitude?: number | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          default_delivery_window?: string | null
          default_latitude?: number | null
          default_longitude?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          active: boolean | null
          created_at: string
          delivery_cost: number
          id: string
          name: string
          polygon_coordinates: Json
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          delivery_cost?: number
          id?: string
          name: string
          polygon_coordinates: Json
        }
        Update: {
          active?: boolean | null
          created_at?: string
          delivery_cost?: number
          id?: string
          name?: string
          polygon_coordinates?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_delivery_cost: {
        Args: { delivery_lat: number; delivery_lng: number }
        Returns: number
      }
      validate_service_area: {
        Args: { delivery_lat: number; delivery_lng: number }
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
