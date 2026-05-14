'use client'

import React, { useActionState } from 'react'
import { resolveFlag } from '@/actions/backoffice/resolve-flag'
import { useFormStatus } from 'react-dom'

interface ResolveFlagButtonProps {
  flagId: string
  listingId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 py-1 rounded disabled:opacity-50"
    >
      {pending ? 'Resolving...' : 'Resolve Flag'}
    </button>
  )
}

type ActionState = {
  success?: boolean
  error?: string
}

export function ResolveFlagButton({ flagId, listingId }: ResolveFlagButtonProps) {
  const [state, action] = useActionState<ActionState | null, FormData>(resolveFlag, null)

  return (
    <form action={action}>
      <input type="hidden" name="flagId" value={flagId} />
      <input type="hidden" name="listingId" value={listingId} />
      <SubmitButton />
      {state?.error && (
        <p className="text-red-600 text-xs mt-1">{state.error}</p>
      )}
    </form>
  )
}
