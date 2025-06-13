import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          github_repo: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          project_type: string | null
          tech_stack: any | null
          features: any | null
          demo_url: string | null
          preview_image_url: string | null
          tags: any | null
          visibility: string | null
          view_count: number | null
          like_count: number | null
          download_count: number | null
          category_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          github_repo?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          project_type?: string | null
          tech_stack?: any | null
          features?: any | null
          demo_url?: string | null
          preview_image_url?: string | null
          tags?: any | null
          visibility?: string | null
          view_count?: number | null
          like_count?: number | null
          download_count?: number | null
          category_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          github_repo?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          project_type?: string | null
          tech_stack?: any | null
          features?: any | null
          demo_url?: string | null
          preview_image_url?: string | null
          tags?: any | null
          visibility?: string | null
          view_count?: number | null
          like_count?: number | null
          download_count?: number | null
          category_id?: string | null
        }
      }
    }
  }
}