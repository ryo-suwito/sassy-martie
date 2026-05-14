'use client'

import React, { useActionState } from 'react'
import { format } from 'date-fns'
import { useFormStatus } from 'react-dom'

type ActionState = {
  success?: boolean
  error?: string
}

interface TasterApplicationCardProps {
  application: {
    id: string
    applicant_id: string
    motivation: string
    status: string
    created_at: string
  }
  onApprove: (prevState: ActionState | null, formData: FormData) => Promise<ActionState | null>
  onReject: (prevState: ActionState | null, formData: FormData) => Promise<ActionState | null>
}

function SubmitButton({ label, color = 'indigo', className = '' }: { label: string; color?: string; className?: string }) {
  const { pending } = useFormStatus()
  const colorClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={`py-2 text-white rounded-md font-medium transition-colors disabled:opacity-50 ${className} ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {pending ? '...' : label}
    </button>
  )
}

export function TasterApplicationCard({ application, onApprove, onReject }: TasterApplicationCardProps) {
  const [approveState, approveAction] = useActionState<ActionState | null, FormData>(onApprove, null)
  const [rejectState, rejectAction] = useActionState<ActionState | null, FormData>(onReject, null)

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Applicant {application.applicant_id.slice(0, 8)}</h3>
          <p className="text-xs text-gray-500">Applied {format(new Date(application.created_at), 'PPP')}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
          application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
          application.status === 'approved' ? 'bg-green-100 text-green-700' : 
          'bg-red-100 text-red-700'
        }`}>
          {application.status}
        </span>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Motivation</h4>
        <p className="text-gray-600 text-sm whitespace-pre-wrap italic bg-gray-50 p-3 rounded italic border border-gray-100">
          &quot;{application.motivation}&quot;
        </p>
      </div>

      {application.status === 'pending' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <form action={approveAction} className="flex-1">
              <input type="hidden" name="applicationId" value={application.id} />
              <SubmitButton label="Approve" color="green" className="w-full" />
            </form>
            <form action={rejectAction} className="flex-1">
              <input type="hidden" name="applicationId" value={application.id} />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="reason" 
                  placeholder="Reason" 
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  required
                />
                <SubmitButton label="Reject" color="red" className="px-4" />
              </div>
            </form>
          </div>
          {(approveState?.error || rejectState?.error) && (
            <p className="text-red-600 text-sm font-medium">
              {approveState?.error || rejectState?.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
