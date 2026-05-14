'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const RejectSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(1),
})

export async function rejectListing(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || !['backoffice_admin', 'backoffice_reviewer'].includes(claims.user_role as string)) {
    return { error: 'Unauthorized' }
  }

  const result = RejectSchema.safeParse({
    listingId: formData.get('listingId'),
    reason: formData.get('reason'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { listingId, reason } = result.data

  const { data: before } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  const { error } = await supabase
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', listingId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'listing.reject',
    target_type: 'listing',
    target_id: listingId,
    payload: { before, after: { status: 'draft' }, reason }
  })

  revalidatePath(`/backoffice/listings/${listingId}`)
  revalidatePath('/backoffice/queue')
  return { success: true }
}
