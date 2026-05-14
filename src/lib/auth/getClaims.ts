import { createClient } from '@/utils/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export interface UserClaims {
  sub: string
  email?: string
  role?: string
  app_metadata?: {
    provider?: string
    [key: string]: unknown
  }
  user_metadata?: {
    [key: string]: unknown
  }
  // Custom claims for SassyMartie
  user_role?: 'user' | 'lister' | 'backoffice' | 'backoffice_admin' | 'backoffice_reviewer'
  is_backoffice?: boolean
}

/**
 * Returns the validated JWT claims from the current session.
 * Uses supabase.auth.getClaims() for synchronous cryptographic validation.
 * Never throws, returns null if no valid session exists.
 */
export async function getClaims(supabase?: SupabaseClient): Promise<UserClaims | null> {
  try {
    const client = supabase || (await createClient())
    
    const { data, error } = await client.auth.getClaims()
    
    if (error || !data || !data.claims) {
      return null
    }
    
    return data.claims as UserClaims
  } catch {
    return null
  }
}
