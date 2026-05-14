'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const RejectSchema = z.object({
  applicationId: z.string().uuid(),
  reason: z.string().min(1),
})

export async function rejectTaster(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || claims.user_role !== 'backoffice_admin') {
    return { error: 'Unauthorized' }
  }

  const result = RejectSchema.safeParse({
    applicationId: formData.get('applicationId'),
    reason: formData.get('reason'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { applicationId, reason } = result.data

  const { error } = await supabase
    .from('taster_applications')
    .update({ 
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: claims.sub,
      rejection_reason: reason
    })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'taster.reject',
    target_type: 'taster_application',
    target_id: applicationId,
    payload: { status: 'rejected', reason }
  })

  revalidatePath('/backoffice/tasters')
  revalidatePath('/backoffice/queue')
  return { success: true }
}
