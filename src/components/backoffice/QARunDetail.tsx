import React from 'react'
import { format } from 'date-fns'

interface QACheck {
  check_type: string
  result: string
  notes: string | null
  checked_at: string
}

interface QARunDetailProps {
  run: {
    id: string
    initiated_at: string
    completed_at: string | null
    overall_result: string
    triggered_by: string
  }
  checks: QACheck[]
}

export function QARunDetail({ run, checks }: QARunDetailProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-gray-900">Run {run.id.slice(0, 8)}</span>
          <span className="ml-2 text-xs text-gray-500">{format(new Date(run.initiated_at), 'PPP pp')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Trigger: {run.triggered_by}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
            run.overall_result === 'pass' ? 'bg-green-100 text-green-700' : 
            run.overall_result === 'fail' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {run.overall_result}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <span className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                check.result === 'pass' ? 'bg-green-500' : 
                check.result === 'fail' ? 'bg-red-500' : 
                'bg-gray-400'
              }`} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 capitalize">{check.check_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400">{format(new Date(check.checked_at), 'p')}</span>
                </div>
                {check.notes && <p className="text-gray-500 mt-1">{check.notes}</p>}
              </div>
            </div>
          ))}
          {checks.length === 0 && <p className="text-gray-500 text-center py-2">No checks recorded for this run.</p>}
        </div>
      </div>
    </div>
  )
}
