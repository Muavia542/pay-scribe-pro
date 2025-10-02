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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string
          description: string | null
          employee_count: number | null
          id: string
          name: string
          total_salary: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_count?: number | null
          id?: string
          name: string
          total_salary?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_count?: number | null
          id?: string
          name?: string
          total_salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          basic_salary: number
          calculated_salary: number | null
          cash_payment: boolean | null
          category: string
          cnic: string
          created_at: string
          department: string
          id: string
          name: string
          updated_at: string
          working_days: number
        }
        Insert: {
          basic_salary: number
          calculated_salary?: number | null
          cash_payment?: boolean | null
          category: string
          cnic: string
          created_at?: string
          department: string
          id?: string
          name: string
          updated_at?: string
          working_days?: number
        }
        Update: {
          basic_salary?: number
          calculated_salary?: number | null
          cash_payment?: boolean | null
          category?: string
          cnic?: string
          created_at?: string
          department?: string
          id?: string
          name?: string
          updated_at?: string
          working_days?: number
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          amount: number
          attendance: number | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          pob: number | null
          rate: number | null
        }
        Insert: {
          amount: number
          attendance?: number | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          pob?: number | null
          rate?: number | null
        }
        Update: {
          amount?: number
          attendance?: number | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          pob?: number | null
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contract_number: string | null
          department: string
          eobi_amount: number
          generated_at: string
          gst_amount: number
          gst_rate: number
          id: string
          invoice_number: string
          month: string
          service_description: string | null
          service_fee: number
          sub_total: number
          total_amount: number
          year: number
        }
        Insert: {
          contract_number?: string | null
          department: string
          eobi_amount?: number
          generated_at?: string
          gst_amount?: number
          gst_rate?: number
          id?: string
          invoice_number: string
          month: string
          service_description?: string | null
          service_fee?: number
          sub_total?: number
          total_amount?: number
          year: number
        }
        Update: {
          contract_number?: string | null
          department?: string
          eobi_amount?: number
          generated_at?: string
          gst_amount?: number
          gst_rate?: number
          id?: string
          invoice_number?: string
          month?: string
          service_description?: string | null
          service_fee?: number
          sub_total?: number
          total_amount?: number
          year?: number
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          basic_salary: number
          calculated_salary: number
          created_at: string
          department: string
          employee_id: string
          employee_name: string
          id: string
          month: string
          working_days: number
          year: number
        }
        Insert: {
          basic_salary: number
          calculated_salary: number
          created_at?: string
          department: string
          employee_id: string
          employee_name: string
          id?: string
          month: string
          working_days: number
          year: number
        }
        Update: {
          basic_salary?: number
          calculated_salary?: number
          created_at?: string
          department?: string
          employee_id?: string
          employee_name?: string
          id?: string
          month?: string
          working_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      yearly_bonus: {
        Row: {
          bonus_amount: number
          bonus_year: number
          category: string
          created_at: string
          department: string
          employee_id: string
          employee_name: string
          id: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number
          bonus_year: number
          category: string
          created_at?: string
          department: string
          employee_id: string
          employee_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number
          bonus_year?: number
          category?: string
          created_at?: string
          department?: string
          employee_id?: string
          employee_name?: string
          id?: string
          updated_at?: string
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
