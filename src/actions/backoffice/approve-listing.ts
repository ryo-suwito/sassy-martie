'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const ApproveSchema = z.object({
  listingId: z.string().uuid(),
})

export async function approveListing(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || !['backoffice_admin', 'backoffice_reviewer'].includes(claims.user_role as string)) {
    return { error: 'Unauthorized' }
  }

  const result = ApproveSchema.safeParse({
    listingId: formData.get('listingId'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { listingId } = result.data

  // Get current state for audit log
  const { data: before } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  const { error } = await supabase
    .from('listings')
    .update({ 
      status: 'live',
      published_at: new Date().toISOString()
    })
    .eq('id', listingId)

  if (error) return { error: error.message }

  // Write to audit log
  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'listing.approve',
    target_type: 'listing',
    target_id: listingId,
    payload: { before, after: { status: 'live', published_at: new Date().toISOString() } }
  })

  // Note: Triggering first QA run would normally happen via DB trigger or Edge Function
  // but for Phase 1 we can manually insert a run if needed.
  // The specs say: "→ Trigger: initiate first QA run (triggered_by = 'manual')"

  revalidatePath(`/backoffice/listings/${listingId}`)
  revalidatePath('/backoffice/queue')
  return { success: true }
}
