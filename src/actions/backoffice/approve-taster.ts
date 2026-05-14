'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getClaims } from '@/lib/auth/getClaims'

const ApproveSchema = z.object({
  applicationId: z.string().uuid(),
})

export async function approveTaster(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)
  
  if (!claims || claims.user_role !== 'backoffice_admin') {
    return { error: 'Unauthorized' }
  }

  const result = ApproveSchema.safeParse({
    applicationId: formData.get('applicationId'),
  })

  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { applicationId } = result.data

  const { error } = await supabase
    .from('taster_applications')
    .update({ 
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: claims.sub
    })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  // Note: DB trigger should auto-create the 'tasters' row

  await supabase.from('audit_log').insert({
    actor_id: claims.sub,
    action: 'taster.approve',
    target_type: 'taster_application',
    target_id: applicationId,
    payload: { status: 'approved' }
  })

  revalidatePath('/backoffice/tasters')
  revalidatePath('/backoffice/queue')
  return { success: true }
}
