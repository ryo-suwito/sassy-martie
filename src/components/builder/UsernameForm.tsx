'use client'

import { useActionState } from 'react'
import { claimUsername } from '@/actions/builder/claim-username'

export function UsernameForm() {
  const [state, action, isPending] = useActionState(claimUsername, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">sassymartie.com/</span>
          <input 
            name="username" 
            required 
            className="flex-1 border rounded p-2" 
            placeholder="your-name" 
          />
        </div>
      </div>
      
      {state?.error && (
        <p className="text-sm text-red-600 font-medium">{state.error}</p>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 text-white rounded p-2 font-medium disabled:opacity-50"
      >
        {isPending ? 'Claiming...' : 'Claim Username'}
      </button>
    </form>
  )
}
