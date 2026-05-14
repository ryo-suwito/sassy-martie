'use server'

import { getClaims } from '@/lib/auth/getClaims'
import { fullListingSchema } from '@/lib/schemas/builder/listingDraft'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitListing(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'Not authenticated.' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'Listing ID is required for submission.' }
  }

  // Fetch current draft to validate
  const { data: listing, error: fetchError } = await supabase
    .schema('catalog')
    .from('listings')
    .select('*, media:listing_media(*)')
    .eq('id', id)
    .eq('lister_id', claims.sub)
    .single()

  if (fetchError || !listing) {
    return { error: 'Draft not found.' }
  }

  if (listing.status !== 'draft') {
    return { error: 'Only drafts can be submitted.' }
  }

  // Validate full schema before submission
  const result = fullListingSchema.safeParse(listing)

  if (!result.success) {
    return { 
      error: 'Submission failed. Your draft is incomplete.', 
      fieldErrors: result.error.flatten().fieldErrors 
    }
  }

  const { error } = await supabase
    .schema('catalog')
    .from('listings')
    .update({ 
      status: 'pending_review',
      submitted_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error submitting listing:', error)
    return { error: 'Failed to submit listing.' }
  }

  revalidatePath('/dashboard/listings')
  revalidatePath(`/dashboard/listings/${id}`)
  return { success: true }
}
