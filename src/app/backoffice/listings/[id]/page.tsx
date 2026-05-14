import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { QARunDetail } from '@/components/backoffice/QARunDetail'
import { AuditLogTable } from '@/components/backoffice/AuditLogTable'
import { FlagCard } from '@/components/backoffice/FlagCard'
import { GracePeriodTimer } from '@/components/backoffice/GracePeriodTimer'
import { ListingActions } from '@/components/backoffice/ListingActions'
import { ResolveFlagButton } from '@/components/backoffice/ResolveFlagButton'

export const dynamic = 'force-dynamic'

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch listing data
  const { data: listing, error: lError } = await supabase
    .from('listings')
    .select('*, lister_profiles(*)')
    .eq('id', id)
    .single()

  if (lError || !listing) {
    notFound()
  }

  // Fetch QA runs and checks
  const { data: qaRuns } = await supabase
    .from('qa_runs')
    .select('*, qa_checks(*)')
    .eq('listing_id', id)
    .order('initiated_at', { ascending: false })

  // Fetch flags
  const { data: flags } = await supabase
    .from('flags')
    .select('*')
    .eq('listing_id', id)
    .order('created_at', { ascending: false })

  // Fetch active grace period
  const { data: activeGracePeriod } = await supabase
    .from('grace_periods')
    .select('*')
    .eq('listing_id', id)
    .is('closed_at', null)
    .maybeSingle()

  // Fetch audit logs
  const { data: auditLogs } = await supabase
    .from('audit_log')
    .select('*')
    .eq('target_type', 'listing')
    .eq('target_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>
          <p className="text-gray-500 mt-1">{listing.tagline}</p>
          <div className="flex gap-4 mt-4">
            <span className="text-sm">
              <span className="font-semibold text-gray-700">Status:</span>{' '}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                listing.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {listing.status}
              </span>
            </span>
            <span className="text-sm">
              <span className="font-semibold text-gray-700">QA:</span>{' '}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                listing.qa_status === 'passing' ? 'bg-green-100 text-green-700' : 
                listing.qa_status === 'grace_period' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {listing.qa_status}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ListingActions 
            listingId={listing.id} 
            status={listing.status} 
            qaStatus={listing.qa_status} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Grace Period Timer */}
          {activeGracePeriod && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Grace Period</h2>
              <GracePeriodTimer deadline={activeGracePeriod.deadline_at} />
              <p className="mt-2 text-sm text-gray-600 italic">&quot;{activeGracePeriod.notes}&quot;</p>
            </section>
          )}

          {/* QA Runs */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">QA History</h2>
            {qaRuns?.map((run) => (
              <QARunDetail key={run.id} run={run} checks={run.qa_checks || []} />
            ))}
            {qaRuns?.length === 0 && <p className="text-gray-500 bg-white p-4 rounded border">No QA runs recorded.</p>}
          </section>

          {/* Audit Log */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Log</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <AuditLogTable logs={auditLogs || []} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Lister Profile */}
          <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Builder Profile</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">{(listing.lister_profiles as { display_name?: string })?.display_name || 'No Name'}</p>
                <p className="text-sm text-gray-500">@{(listing.lister_profiles as { username: string })?.username}</p>
              </div>
            </div>
            <Link 
              href={`/backoffice/builders`} 
              className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all builders
            </Link>
          </section>

          {/* Flags */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Flags</h2>
            <div className="space-y-4">
              {flags?.map((flag) => (
                <div key={flag.id}>
                  <FlagCard 
                    flag={flag} 
                    onResolve={() => {}} 
                  />
                  {!flag.resolved_at && (
                    <ResolveFlagButton flagId={flag.id} listingId={listing.id} />
                  )}
                </div>
              ))}
              {flags?.length === 0 && <p className="text-gray-500 italic">No flags reported.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
