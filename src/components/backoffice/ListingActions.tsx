'use client'

import React, { useActionState } from 'react'
import { approveListing } from '@/actions/backoffice/approve-listing'
import { rejectListing } from '@/actions/backoffice/reject-listing'
import { openGracePeriod } from '@/actions/backoffice/open-grace-period'
import { useFormStatus } from 'react-dom'

interface ListingActionsProps {
  listingId: string
  status: string
  qaStatus: string
}

function SubmitButton({ label, color = 'indigo' }: { label: string; color?: string }) {
  const { pending } = useFormStatus()
  const colorClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {pending ? 'Processing...' : label}
    </button>
  )
}

type ActionState = {
  success?: boolean
  error?: string
}

export function ListingActions({ listingId, status, qaStatus }: ListingActionsProps) {
  const [approveState, approveAction] = useActionState<ActionState | null, FormData>(approveListing, null)
  const [rejectState, rejectAction] = useActionState<ActionState | null, FormData>(rejectListing, null)
  const [graceState, graceAction] = useActionState<ActionState | null, FormData>(openGracePeriod, null)

  return (
    <div className="flex flex-col gap-4">
      {status === 'pending_review' && (
        <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-4 items-center">
            <form action={approveAction}>
              <input type="hidden" name="listingId" value={listingId} />
              <SubmitButton label="Approve Listing" color="green" />
            </form>
            
            <form action={rejectAction} className="flex flex-1 gap-2">
              <input type="hidden" name="listingId" value={listingId} />
              <input 
                type="text" 
                name="reason" 
                placeholder="Reason for rejection" 
                required 
                className="flex-1 px-3 py-2 border rounded-md text-sm" 
              />
              <SubmitButton label="Reject" color="red" />
            </form>
          </div>
          {(approveState?.error || rejectState?.error) && (
            <p className="text-red-600 text-sm font-medium">
              {approveState?.error || rejectState?.error}
            </p>
          )}
        </div>
      )}

      {qaStatus !== 'grace_period' && status === 'live' && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <form action={graceAction} className="flex gap-2">
            <input type="hidden" name="listingId" value={listingId} />
            <input 
              type="text" 
              name="reason" 
              placeholder="Manual grace period reason" 
              required 
              className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm" 
            />
            <SubmitButton label="Open Grace Period" color="yellow" />
          </form>
          {graceState?.error && (
            <p className="text-red-600 text-sm font-medium mt-2">
              {graceState?.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
