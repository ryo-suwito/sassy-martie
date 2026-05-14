'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const GracePeriodSchema = z.object({
  listingId: z.string().uuid(),
  qaRunId: z.string().uuid().optional(),
  reason: z.string().min(1),
  hours: z.number().default(48),
})

export async function openGracePeriod(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || claims.user_role !== 'backoffice_admin') {
    return { error: 'Unauthorized - Admin only' }
  }

  const result = GracePeriodSchema.safeParse({
    listingId: formData.get('listingId'),
    qaRunId: formData.get('qaRunId') || undefined,
    reason: formData.get('reason'),
    hours: Number(formData.get('hours')) || 48,
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { listingId, qaRunId, reason, hours } = result.data

  const deadline = new Date()
  deadline.setHours(deadline.getHours() + hours)

  // Use a fallback UUID if qaRunId is not provided (manual grace period)
  // In a real system we'd probably want a way to handle this more cleanly in the DB
  const { data: gracePeriod, error: gpError } = await supabase
    .from('grace_periods')
    .insert({
      listing_id: listingId,
      qa_run_id: qaRunId || '00000000-0000-0000-0000-000000000000', // Mock UUID if missing
      deadline_at: deadline.toISOString(),
      notes: reason
    })
    .select()
    .single()

  if (gpError) return { error: gpError.message }

  const { error: lError } = await supabase
    .from('listings')
    .update({ qa_status: 'grace_period' })
    .eq('id', listingId)

  if (lError) return { error: lError.message }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'grace_period.open',
    target_type: 'listing',
    target_id: listingId,
    payload: { grace_period_id: gracePeriod.id, reason, deadline_at: deadline.toISOString() }
  })

  revalidatePath(`/backoffice/listings/${listingId}`)
  return { success: true }
}
