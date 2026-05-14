import { createClient } from '@/utils/supabase/server'

export async function QAHealthTimeline({ listingId }: { listingId: string }) {
  const supabase = await createClient()

  const { data: auditLogs, error } = await supabase
    .schema('backoffice')
    .from('audit_log')
    .select('action, payload, created_at')
    .eq('target_type', 'listing')
    .eq('target_id', listingId)
    .in('action', [
      'listing.approve', 'listing.reject', 'grace_period.open',
      'grace_period.close', 'badge.revoke', 'badge.grant'
    ])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching audit logs:', error)
    return <div className="text-sm text-red-500">Failed to load health timeline.</div>
  }

  if (!auditLogs || auditLogs.length === 0) {
    return <div className="text-sm text-gray-500 italic">No QA history yet. This tool is fresh!</div>
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {auditLogs.map((log, logIdx) => (
          <li key={logIdx}>
            <div className="relative pb-8">
              {logIdx !== auditLogs.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActionColor(log.action)}`}>
                    {/* Icon placeholder */}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {getActionMessage(log.action, log.payload)}{' '}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleDateString()}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getActionColor(action: string) {
  switch (action) {
    case 'listing.approve':
    case 'badge.grant':
      return 'bg-green-500'
    case 'listing.reject':
    case 'badge.revoke':
      return 'bg-red-500'
    case 'grace_period.open':
      return 'bg-yellow-500'
    case 'grace_period.close':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

function getActionMessage(action: string, payload: Record<string, unknown> | null) {
  switch (action) {
    case 'listing.approve': return 'Listing approved'
    case 'listing.reject': return 'Listing rejected'
    case 'badge.grant': return `Badge granted: ${payload?.badge_code || 'Badge'}`
    case 'badge.revoke': return `Badge revoked: ${payload?.badge_code || 'Badge'}`
    case 'grace_period.open': return 'Grace period opened'
    case 'grace_period.close': return 'Grace period closed'
    default: return action
  }
}
