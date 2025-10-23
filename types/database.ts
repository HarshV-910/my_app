export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'host' | 'member'
          status: 'pending' | 'approved'
        }
        Insert: {
          id: string
          name: string
          role?: 'host' | 'member'
          status?: 'pending' | 'approved'
        }
        Update: {
          id?: string
          name?: string
          role?: 'host' | 'member'
          status?: 'pending' | 'approved'
        }
      }
      events: {
        Row: {
          id: string
          name: string
          year: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          year: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          year?: number
          image_url?: string | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          event_id: string
          name: string
          available_stock_kg: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          available_stock_kg: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          available_stock_kg?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          member_id: string
          event_id: string
          item_id: string
          customer_name: string
          quantity_kg: number
          amount_inr: number
          payment_status: 'Baki' | 'Cash' | 'Online'
          verified: boolean
          edited: boolean
          date_time: string
        }
        Insert: {
          id?: string
          member_id: string
          event_id: string
          item_id: string
          customer_name: string
          quantity_kg: number
          amount_inr: number
          payment_status?: 'Baki' | 'Cash' | 'Online'
          verified?: boolean
          edited?: boolean
          date_time?: string
        }
        Update: {
          id?: string
          member_id?: string
          event_id?: string
          item_id?: string
          customer_name?: string
          quantity_kg?: number
          amount_inr?: number
          payment_status?: 'Baki' | 'Cash' | 'Online'
          verified?: boolean
          edited?: boolean
          date_time?: string
        }
      }
      expenses: {
        Row: {
          id: string
          added_by_id: string
          event_id: string
          name: string
          amount_inr: number
          verified: boolean
          date_time: string
        }
        Insert: {
          id?: string
          added_by_id: string
          event_id: string
          name: string
          amount_inr: number
          verified?: boolean
          date_time?: string
        }
        Update: {
          id?: string
          added_by_id?: string
          event_id?: string
          name?: string
          amount_inr?: number
          verified?: boolean
          date_time?: string
        }
      }
      notes: {
        Row: {
          id: string
          member_id: string
          event_id: string
          content: string | null
          image_urls: string[] | null
          date_time: string
        }
        Insert: {
          id?: string
          member_id: string
          event_id: string
          content?: string | null
          image_urls?: string[] | null
          date_time?: string
        }
        Update: {
          id?: string
          member_id?: string
          event_id?: string
          content?: string | null
          image_urls?: string[] | null
          date_time?: string
        }
      }
      stored_files: {
        Row: {
          id: string
          uploaded_by_id: string
          name: string
          file_path: string
          upload_date: string
        }
        Insert: {
          id?: string
          uploaded_by_id: string
          name: string
          file_path: string
          upload_date?: string
        }
        Update: {
          id?: string
          uploaded_by_id?: string
          name?: string
          file_path?: string
          upload_date?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_status: 'Baki' | 'Cash' | 'Online'
      user_role: 'host' | 'member'
      user_status: 'pending' | 'approved'
    }
  }
}
