import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { TasterApplicationCard } from '@/components/backoffice/TasterApplicationCard'
import { approveTaster } from '@/actions/backoffice/approve-taster'
import { rejectTaster } from '@/actions/backoffice/reject-taster'

export const dynamic = 'force-dynamic'

export default async function TastersPage() {
  const supabase = await createClient()

  const { data: applications, error } = await supabase
    .from('taster_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching taster applications:', error)
    return <div>Error loading applications.</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Taster Committee Applications</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications?.map((app) => (
          <TasterApplicationCard 
            key={app.id} 
            application={app} 
            onApprove={approveTaster}
            onReject={rejectTaster}
          />
        ))}
        {applications?.length === 0 && (
          <p className="col-span-2 text-center text-gray-500 bg-white p-8 rounded border">
            No taster applications found.
          </p>
        )}
      </div>
    </div>
  )
}
