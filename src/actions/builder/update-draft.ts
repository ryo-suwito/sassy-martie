'use server'

import { getClaims } from '@/lib/auth/getClaims'
import { fullListingSchema } from '@/lib/schemas/builder/listingDraft'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDraft(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'Not authenticated.' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'Listing ID is required.' }
  }

  const rawData = Object.fromEntries(formData.entries())
  const result = fullListingSchema.partial().safeParse(rawData)

  if (!result.success) {
    return { error: 'Validation failed.', fieldErrors: result.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .schema('catalog')
    .from('listings')
    .update(result.data as Record<string, unknown>)
    .eq('id', id)
    .eq('lister_id', claims.sub)
    .eq('status', 'draft')

  if (error) {
    console.error('Error updating draft:', error)
    return { error: 'Failed to update draft.' }
  }

  revalidatePath(`/dashboard/listings/${id}`)
  return { success: true }
}
