'use client'

import { useActionState } from 'react'
import { submitTasterApplication } from '@/actions/community/submit-taster-application'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TasterApplyPage() {
  const [state, formAction, isPending] = useActionState(submitTasterApplication, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push('/apply/taster/confirmation')
    }
  }, [state, router])

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Join the Taster Committee</h1>
      <p className="text-lg mb-8">
        Do you have a refined palate for quality? Martie is looking for discerning individuals 
        to help curate our catalog. As a Taster, you&apos;ll vote on new listings and earn rewards.
      </p>

      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="motivation" className="block text-sm font-medium mb-2">
            Why do you want to be a Taster?
          </label>
          <textarea
            id="motivation"
            name="motivation"
            rows={6}
            required
            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Tell Martie about your experience and why you&apos;d be a great fit..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Min 20 characters, Max 1000.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Sending to Martie...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
