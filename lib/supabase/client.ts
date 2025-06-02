import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "../database.types"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing Supabase environment variables:
      - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓" : "✗"}
      
      Please check your environment variables.`,
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'carpooling-app'
      }
    }
  })
}
