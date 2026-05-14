import React from 'react'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function BuildersPage() {
  const supabase = await createClient()

  const { data: builders, error } = await supabase
    .from('lister_profiles')
    .select('*, listings(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching builders:', error)
    return <div>Error loading builders.</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Builders</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {builders?.map((builder) => (
            <li key={builder.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-medium text-indigo-600">{builder.display_name || 'No Name'}</h2>
                    <p className="text-sm text-gray-500">@{builder.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {(builder.listings as unknown as { count: number }[])?.[0]?.count || 0} Tools
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(builder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
