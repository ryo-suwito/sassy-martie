import React from 'react'
import { format } from 'date-fns'

interface FlagCardProps {
  flag: {
    id: string
    reason: string
    severity: string
    created_at: string
    resolved_at: string | null
    flagged_by: string
  }
  onResolve?: (id: string) => void
}

export function FlagCard({ flag, onResolve }: FlagCardProps) {
  const severityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  }

  return (
    <div className={`p-4 rounded-lg border ${flag.resolved_at ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${severityColors[flag.severity as keyof typeof severityColors]}`}>
            {flag.severity}
          </span>
          {flag.resolved_at && (
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-green-100 text-green-700">
              Resolved
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{format(new Date(flag.created_at), 'PPP')}</span>
      </div>
      <p className="text-gray-900 font-medium mb-3">{flag.reason}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>By {flag.flagged_by.slice(0, 8)}</span>
        {!flag.resolved_at && onResolve && (
          <button 
            onClick={() => onResolve(flag.id)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  )
}
