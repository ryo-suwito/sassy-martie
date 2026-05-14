import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { SubmissionWizard } from '@/components/builder/SubmissionWizard'
import { QAHealthTimeline } from '@/components/builder/QAHealthTimeline'
import { ListingStatusBadge } from '@/components/builder/ListingStatusBadge'
import { Listing } from '@/types/catalog'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()
  const claims = await getClaims(supabase)

  if (!claims) redirect('/auth/login')

  const { data: listing, error } = await supabase
    .schema('catalog')
    .from('listings')
    .select('*, media:listing_media(*)')
    .eq('id', id)
    .eq('lister_id', claims.sub)
    .single()

  if (error || !listing) {
    notFound()
  }

  const isDraft = listing.status === 'draft'

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href="/dashboard/listings" 
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={16} />
        Back to Tools
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{listing.name}</h1>
            <ListingStatusBadge status={listing.status} />
          </div>
          <p className="text-gray-500">{listing.tagline}</p>
        </div>
        {!isDraft && (
          <a 
            href={listing.external_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
          >
            Visit Site
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {isDraft ? (
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Continue Submission</h2>
          <SubmissionWizard initialListing={listing as Listing & { media: { url: string; type: string }[] }} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-4">QA Health Timeline</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Martie&apos;s QA engine periodically checks your tool. High uptime and valid certificates keep your badges active.
            </p>
            <QAHealthTimeline listingId={listing.id} />
          </div>

          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Listing Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Pricing Model</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{listing.pricing_model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.slug}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">External URL</dt>
                <dd className="mt-1 text-sm text-blue-600 hover:underline">
                  <a href={listing.external_url} target="_blank" rel="noopener noreferrer">{listing.external_url}</a>
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Target Audience</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.target_audience_description || 'None provided.'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
