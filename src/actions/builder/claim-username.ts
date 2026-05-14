'use server'

import { getClaims } from '@/lib/auth/getClaims'
import { listerProfileSchema } from '@/lib/schemas/builder/listerProfile'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimUsername(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'Not authenticated. Martie says login first!' }
  }

  const username = formData.get('username')
  const result = listerProfileSchema.pick({ username: true }).safeParse({ username })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors.username?.[0] || 'Invalid username' }
  }

  const { data: profile } = await supabase
    .schema('builder')
    .from('lister_profiles')
    .select('id')
    .eq('username', result.data.username)
    .single()

  if (profile) {
    return { error: 'That username is taken. Be more original!' }
  }

  const { error } = await supabase
    .schema('builder')
    .from('lister_profiles')
    .update({ username: result.data.username })
    .eq('id', claims.sub)

  if (error) {
    console.error('Error claiming username:', error)
    return { error: 'Something broke on our end. Martie is on it.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
