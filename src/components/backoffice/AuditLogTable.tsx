import React from 'react'
import { format } from 'date-fns'

interface AuditLogEntry {
  id: string
  action: string
  actor_id: string | null
  created_at: string
  payload: unknown
}

interface AuditLogTableProps {
  logs: AuditLogEntry[]
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {log.action}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.actor_id ? log.actor_id.slice(0, 8) : 'System'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <details className="cursor-pointer">
                  <summary className="text-indigo-600 hover:text-indigo-900">View Payload</summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-w-xs">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                No audit logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
