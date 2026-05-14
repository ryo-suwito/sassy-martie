'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const FlagSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
})

export async function flagTool(formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || !['backoffice_admin', 'backoffice_reviewer'].includes(claims.user_role as string)) {
    return { error: 'Unauthorized' }
  }

  const result = FlagSchema.safeParse({
    listingId: formData.get('listingId'),
    reason: formData.get('reason'),
    severity: formData.get('severity'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { listingId, reason, severity } = result.data

  const { data: flag, error } = await supabase
    .from('flags')
    .insert({
      listing_id: listingId,
      flagged_by: claims.sub,
      reason,
      severity
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // If severity = 'critical': immediately trigger grace_period opening as side effect
  if (severity === 'critical') {
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + 48)

    await supabase
      .from('grace_periods')
      .insert({
        listing_id: listingId,
        qa_run_id: '00000000-0000-0000-0000-000000000000', // Manual
        deadline_at: deadline.toISOString(),
        notes: `Critical flag: ${reason}`
      })

    await supabase
      .from('listings')
      .update({ qa_status: 'grace_period' })
      .eq('id', listingId)
  }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'listing.flag',
    target_type: 'listing',
    target_id: listingId,
    payload: { flag_id: flag.id, severity, reason }
  })

  revalidatePath(`/backoffice/listings/${listingId}`)
  revalidatePath('/backoffice/queue')
  return { success: true }
}
