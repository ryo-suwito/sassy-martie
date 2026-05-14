'use client'

import { useActionState, useEffect } from 'react'
import { castTasteVote } from '@/actions/community/cast-taste-vote'
import { useRouter } from 'next/navigation'

interface VoteFormProps {
  listingId: string
  qaRunId: string
}

export default function VoteForm({ listingId, qaRunId }: VoteFormProps) {
  const [state, formAction, isPending] = useActionState(castTasteVote, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/taster/vote')
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="qaRunId" value={qaRunId} />

      <div>
        <label className="block text-sm font-medium mb-4 text-gray-700">
          How would you rate the taste and quality of this tool?
        </label>
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <label key={num} className="flex-1 text-center cursor-pointer group">
              <input
                type="radio"
                name="score"
                value={num}
                required
                className="sr-only peer"
              />
              <div className="py-4 border-2 border-gray-100 rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-gray-50 transition-all">
                <span className="text-2xl font-bold text-gray-400 peer-checked:text-primary group-hover:text-gray-600">
                  {num}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
          <span>Poor</span>
          <span>Exquisite</span>
        </div>
      </div>

      <div>
        <label htmlFor="rationale" className="block text-sm font-medium mb-2 text-gray-700">
          Rationale (Optional)
        </label>
        <textarea
          id="rationale"
          name="rationale"
          rows={4}
          className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Why this score? Your feedback helps the builder improve..."
        />
        <p className="mt-2 text-xs text-gray-500">
          Visible to the builder if the final verdict is negative. Be constructive!
        </p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-6 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all text-lg shadow-sm"
      >
        {isPending ? 'Submitting Vote...' : 'Submit Verdict'}
      </button>
    </form>
  )
}
