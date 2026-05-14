'use server'

import { getClaims } from '@/lib/auth/getClaims'
import { fullListingSchema } from '@/lib/schemas/builder/listingDraft'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDraft(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'Not authenticated.' }
  }

  const id = formData.get('id') as string | null
  const rawData = Object.fromEntries(formData.entries())
  
  // For partial saves, we might only have some fields.
  // We use .partial() or just pick what we have.
  // But the requirement says "upserts listings with status = 'draft'".
  const result = fullListingSchema.partial().safeParse(rawData)

  if (!result.success) {
    return { error: 'Validation failed.', fieldErrors: result.error.flatten().fieldErrors }
  }

  const listingData = {
    ...result.data,
    lister_id: claims.sub,
    status: 'draft',
    updated_at: new Date().toISOString(),
  }

  // Handle media separately if present
  const { media, ...coreData } = listingData as { media?: unknown[] }

  let listingId = id

  if (listingId) {
    // Update
    const { error } = await supabase
      .schema('catalog')
      .from('listings')
      .update(coreData)
      .eq('id', listingId)
      .eq('lister_id', claims.sub) // Safety
      .eq('status', 'draft') // Only drafts can be saved as draft

    if (error) {
      console.error('Error updating draft:', error)
      return { error: 'Failed to update draft.' }
    }
  } else {
    // Create
    const { data, error } = await supabase
      .schema('catalog')
      .from('listings')
      .insert({ ...coreData, status: 'draft' })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating draft:', error)
      return { error: 'Failed to create draft.' }
    }
    listingId = data.id
  }

  // Handle media if Step 3
  if (media && media.length > 0) {
    // Simple strategy: delete existing and insert new
    await supabase.schema('catalog').from('listing_media').delete().eq('listing_id', listingId)
    const { error: mediaError } = await supabase
      .schema('catalog')
      .from('listing_media')
      .insert(media.map((m: unknown) => ({ ...(m as Record<string, unknown>), listing_id: listingId })))
    
    if (mediaError) {
      console.error('Error saving media:', mediaError)
    }
  }

  revalidatePath('/dashboard/listings')
  return { success: true, id: listingId }
}
