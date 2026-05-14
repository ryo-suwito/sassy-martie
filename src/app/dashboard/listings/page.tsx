import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { DraftCard } from '@/components/builder/DraftCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ListingsPage() {
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) redirect('/auth/login')

  const { data: listings, error } = await supabase
    .schema('catalog')
    .from('listings')
    .select('*')
    .eq('lister_id', claims.sub)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
    return <div>Failed to load listings.</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Tools</h1>
          <p className="text-gray-500">Manage your portfolio and track QA health.</p>
        </div>
        <Link 
          href="/dashboard/listings/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-xl">
          <h3 className="text-lg font-medium mb-2">You haven&apos;t listed any tools yet.</h3>
          <p className="text-gray-500 mb-6">Start by submitting your first tool to Martie&apos;s catalog.</p>
          <Link 
            href="/dashboard/listings/new" 
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first listing &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <DraftCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
