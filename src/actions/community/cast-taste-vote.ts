'use server'

import { createClient } from '@/utils/supabase/server'
import { requireTaster } from '@/lib/auth/guards'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const voteSchema = z.object({
  listingId: z.string().uuid(),
  qaRunId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  rationale: z.string().max(500, 'Keep it helpful but concise (Max 500 characters)').optional(),
})

export async function castTasteVote(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const claims = await requireTaster(supabase)

  const rawScore = formData.get('score')
  const payload = {
    listingId: formData.get('listingId'),
    qaRunId: formData.get('qaRunId'),
    score: rawScore ? parseInt(rawScore as string) : undefined,
    rationale: formData.get('rationale') || undefined,
  }

  const validation = voteSchema.safeParse(payload)

  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase
    .schema('community')
    .from('taste_votes')
    .insert({
      listing_id: validation.data.listingId,
      taster_id: claims.sub,
      qa_run_id: validation.data.qaRunId,
      score: validation.data.score,
      rationale: validation.data.rationale,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: "You've already voted on this one, eagle-eye." }
    }
    console.error('Taste Vote Error:', error)
    return { error: 'Something went sideways. Martie is looking into it.' }
  }

  revalidatePath('/dashboard/taster')
  revalidatePath('/dashboard/taster/vote')
  return { success: true }
}
