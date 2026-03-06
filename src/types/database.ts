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
      staff_profiles: {
        Row: {
          id: string
          full_name: string
          username: string
          role: 'admin' | 'seller'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          username: string
          role: 'admin' | 'seller'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['staff_profiles']['Insert']>
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
        Relationships: []
      }
      products: {
        Row: {
          id: string
          internal_code: string
          name: string
          description: string | null
          category_id: string
          brand_id: string | null
          inventory_mode: 'serial' | 'quantity'
          serial_kind: 'imei' | 'serial_number' | null
          reference_cost: number
          suggested_price: number
          minimum_price: number
          low_stock_threshold: number
          simple_stock: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          internal_code: string
          name: string
          description?: string | null
          category_id: string
          brand_id?: string | null
          inventory_mode: 'serial' | 'quantity'
          serial_kind?: 'imei' | 'serial_number' | null
          reference_cost?: number
          suggested_price?: number
          minimum_price?: number
          low_stock_threshold?: number
          simple_stock?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      serialized_units: {
        Row: {
          id: string
          product_id: string
          serial_value: string
          status: 'available' | 'sold' | 'inactive'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          serial_value: string
          status?: 'available' | 'sold' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['serialized_units']['Insert']>
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          national_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          national_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          sold_at: string
          seller_profile_id: string
          customer_id: string | null
          total_amount: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sold_at?: string
          seller_profile_id: string
          customer_id?: string | null
          total_amount?: number
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sales']['Insert']>
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          serialized_unit_id: string | null
          quantity: number
          unit_cost_snapshot: number
          unit_price_sold: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          serialized_unit_id?: string | null
          quantity?: number
          unit_cost_snapshot: number
          unit_price_sold: number
          subtotal: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>
        Relationships: []
      }
      layaway_plans: {
        Row: {
          id: string
          customer_id: string | null
          product_id: string
          agreed_total: number
          amount_paid: number
          remaining_balance: number
          status: 'active' | 'paid' | 'delivered' | 'cancelled'
          notes: string | null
          created_by_profile_id: string
          created_at: string
          paid_at: string | null
          delivered_at: string | null
          final_sale_id: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          product_id: string
          agreed_total: number
          amount_paid?: number
          remaining_balance: number
          status?: 'active' | 'paid' | 'delivered' | 'cancelled'
          notes?: string | null
          created_by_profile_id: string
          created_at?: string
          paid_at?: string | null
          delivered_at?: string | null
          final_sale_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['layaway_plans']['Insert']>
        Relationships: []
      }
      layaway_payments: {
        Row: {
          id: string
          layaway_plan_id: string
          amount: number
          paid_at: string
          received_by_profile_id: string
          notes: string | null
        }
        Insert: {
          id?: string
          layaway_plan_id: string
          amount: number
          paid_at?: string
          received_by_profile_id: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['layaway_payments']['Insert']>
        Relationships: []
      }
      warranties: {
        Row: {
          id: string
          sale_item_id: string
          serialized_unit_id: string
          customer_id: string | null
          starts_at: string
          ends_at: string
          coverage: string
          status: 'active' | 'expired' | 'void'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sale_item_id: string
          serialized_unit_id: string
          customer_id?: string | null
          starts_at: string
          ends_at: string
          coverage: string
          status?: 'active' | 'expired' | 'void'
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['warranties']['Insert']>
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          serialized_unit_id: string | null
          movement_type: string
          quantity: number
          reason: string
          performed_by_profile_id: string
          sale_item_id: string | null
          layaway_plan_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          serialized_unit_id?: string | null
          movement_type: string
          quantity: number
          reason: string
          performed_by_profile_id: string
          sale_item_id?: string | null
          layaway_plan_id?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['inventory_movements']['Insert']>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          performed_by_profile_id: string | null
          entity_name: string
          entity_id: string
          action: string
          old_values: Json | null
          new_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          performed_by_profile_id?: string | null
          entity_name: string
          entity_id: string
          action: string
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      adjust_quantity_stock: {
        Args: {
          p_product_id: string
          p_performed_by_profile_id: string
          p_delta: number
          p_reason: string
        }
        Returns: string
      }
      add_serialized_unit: {
        Args: {
          p_product_id: string
          p_serial_value: string
          p_performed_by_profile_id: string
          p_notes?: string | null
        }
        Returns: string
      }
      deactivate_serialized_unit: {
        Args: {
          p_serialized_unit_id: string
          p_performed_by_profile_id: string
          p_reason: string
        }
        Returns: string
      }
      create_quantity_sale: {
        Args: {
          p_seller_profile_id: string
          p_product_id: string
          p_quantity: number
          p_unit_price_sold: number
          p_customer_id?: string | null
          p_notes?: string | null
        }
        Returns: string
      }
      create_serial_sale: {
        Args: {
          p_seller_profile_id: string
          p_product_id: string
          p_serialized_unit_id: string
          p_unit_price_sold: number
          p_customer_id?: string | null
          p_notes?: string | null
        }
        Returns: string
      }
      create_layaway_plan: {
        Args: {
          p_created_by_profile_id: string
          p_product_id: string
          p_agreed_total: number
          p_customer_id?: string | null
          p_notes?: string | null
        }
        Returns: string
      }
      add_layaway_payment: {
        Args: {
          p_layaway_plan_id: string
          p_received_by_profile_id: string
          p_amount: number
          p_notes?: string | null
        }
        Returns: string
      }
      deliver_quantity_layaway: {
        Args: {
          p_layaway_plan_id: string
          p_seller_profile_id: string
        }
        Returns: string
      }
      deliver_serial_layaway: {
        Args: {
          p_layaway_plan_id: string
          p_seller_profile_id: string
          p_serialized_unit_id: string
        }
        Returns: string
      }
      cancel_layaway_plan: {
        Args: {
          p_layaway_plan_id: string
          p_cancelled_by_profile_id: string
          p_reason?: string | null
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
