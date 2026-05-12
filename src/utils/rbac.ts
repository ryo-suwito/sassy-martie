import { createClient } from './supabase/server'

export type UserRole = 'user' | 'lister' | 'backoffice'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return profile.role as UserRole
}

export async function requireRole(requiredRoles: UserRole[]) {
  const role = await getUserRole()
  if (!role || !requiredRoles.includes(role)) {
    throw new Error('Unauthorized')
  }
  return role
}
