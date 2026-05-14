import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { WorkQueueSection } from '@/components/backoffice/WorkQueueSection'
import { WorkQueueItem } from '@/components/backoffice/WorkQueueItem'

export const dynamic = 'force-dynamic'

export default async function QueuePage() {
  const supabase = await createClient()

  const { data: queueItems, error } = await supabase
    .from('work_queue')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching work queue:', error)
    return <div>Error loading work queue.</div>
  }

  const sections = {
    expiring_grace_period: {
      title: 'Priority 1: Expiring Soon',
      items: queueItems?.filter(i => i.task_type === 'expiring_grace_period') || []
    },
    pending_taste_test: {
      title: 'Priority 2: Taste Checks Needed',
      items: queueItems?.filter(i => i.task_type === 'pending_taste_test') || []
    },
    pending_listing: {
      title: 'Priority 3: New Submissions',
      items: queueItems?.filter(i => i.task_type === 'pending_listing') || []
    },
    open_flag: {
      title: 'Priority 4: Unresolved Flags',
      items: queueItems?.filter(i => i.task_type === 'open_flag') || []
    },
    pending_taster_app: {
      title: 'Priority 5: Taster Applications',
      items: queueItems?.filter(i => i.task_type === 'pending_taster_app') || []
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Work Queue</h1>
      
      {Object.values(sections).every(s => s.items.length === 0) ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">The queue is empty. Good job, Martie!</p>
        </div>
      ) : (
        <>
          {Object.entries(sections).map(([key, section]) => (
            <WorkQueueSection key={key} title={section.title} count={section.items.length}>
              {section.items.map((item) => (
                <WorkQueueItem 
                  key={item.target_id || Math.random().toString()} 
                  task_type={item.task_type || ''}
                  target_id={item.target_id || ''}
                  created_at={item.created_at || ''}
                  description={item.description || ''}
                />
              ))}
            </WorkQueueSection>
          ))}
        </>
      )}
    </div>
  )
}
