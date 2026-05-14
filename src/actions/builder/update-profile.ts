'use server'

import { getClaims } from '@/lib/auth/getClaims'
import { listerProfileSchema } from '@/lib/schemas/builder/listerProfile'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'Not authenticated.' }
  }

  const rawData = Object.fromEntries(formData.entries())
  const result = listerProfileSchema.safeParse(rawData)

  if (!result.success) {
    return { error: 'Validation failed.', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .schema('builder')
    .from('lister_profiles')
    .update(result.data)
    .eq('id', claims.sub)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'Failed to update profile.' }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
