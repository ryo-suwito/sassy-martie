import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { QARunDetail } from '@/components/backoffice/QARunDetail'

export const dynamic = 'force-dynamic'

export default async function QARunsPage() {
  const supabase = await createClient()

  const { data: runs, error } = await supabase
    .from('qa_runs')
    .select('*, listings(name), qa_checks(*)')
    .order('initiated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching QA runs:', error)
    return <div>Error loading QA runs.</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">QA Run History</h1>
      <div className="space-y-6">
        {runs?.map((run) => (
          <div key={run.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="font-bold text-gray-900">{(run.listings as { name: string } | null)?.name}</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-gray-500 text-sm">Run ID: {run.id}</span>
            </div>
            <QARunDetail run={run} checks={run.qa_checks || []} />
          </div>
        ))}
      </div>
    </div>
  )
}
