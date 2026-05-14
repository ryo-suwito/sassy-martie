import { redirect } from 'next/navigation'
import { getClaims, UserClaims } from './getClaims'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures the user is authenticated. 
 * If not, redirects to /auth/login with the current path as the next parameter.
 */
export async function requireAuth(supabase?: SupabaseClient): Promise<UserClaims> {
  const claims = await getClaims(supabase)
  
  if (!claims) {
    // In a real app, we might want to capture the current URL
    // But for now, just redirect to login
    redirect('/auth/login')
  }
  
  return claims
}

/**
 * Ensures the user has a specific role claim.
 * Throws a 403 error if the role is insufficient.
 */
export async function requireRole(
  supabase: SupabaseClient, 
  requiredRole: UserClaims['user_role']
): Promise<UserClaims> {
  const claims = await requireAuth(supabase)
  
  if (claims.user_role !== requiredRole) {
    // Throws a generic error that should be handled by an error boundary or Next.js
    throw new Error('403: Forbidden - Insufficient Permissions')
  }
  
  return claims
}

/**
 * Ensures the user has one of the specified role claims.
 * Throws a 403 error if the role is insufficient.
 */
export async function requireAnyRole(
  supabase: SupabaseClient,
  roles: UserClaims['user_role'][]
): Promise<UserClaims> {
  const claims = await requireAuth(supabase)
  
  if (!claims.user_role || !roles.includes(claims.user_role)) {
    throw new Error('403: Forbidden - Insufficient Permissions')
  }
  
  return claims
}

/**
 * Ensures the user is an active taster.
 */
export async function requireTaster(supabase: SupabaseClient): Promise<UserClaims> {
  const claims = await requireAuth(supabase)
  
  const { data: taster, error } = await supabase
    .schema('community')
    .from('tasters')
    .select('status')
    .eq('id', claims.sub)
    .single()
    
  if (error || !taster || taster.status !== 'active') {
    throw new Error('403: Forbidden - Active Taster Status Required')
  }
  
  return claims
}
