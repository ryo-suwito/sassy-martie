'use server'

import { createClient } from '@/utils/supabase/server'
import { getClaims } from '@/lib/auth/getClaims'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const applicationSchema = z.object({
  motivation: z.string().min(20, 'Martie needs a bit more detail! (At least 20 characters)').max(1000, 'Keep it punchy! (Max 1000 characters)'),
})

export async function submitTasterApplication(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) {
    return { error: 'You must be logged in to apply, friend.' }
  }

  const rawMotivation = formData.get('motivation')
  const validation = applicationSchema.safeParse({ motivation: rawMotivation })

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase
    .schema('community')
    .from('taster_applications')
    .insert({
      applicant_id: claims.sub,
      motivation: validation.data.motivation,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: "You've already applied! Martie is still chewing on your application." }
    }
    console.error('Taster Application Error:', error)
    return { error: 'Something went sideways on our end. Try again?' }
  }

  revalidatePath('/dashboard/taster')
  return { success: true }
}
