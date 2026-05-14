import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, ExternalLink } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { getListingBySlug, getListerListings } from "@/lib/catalog";
import TrustSummary from "@/components/catalog/TrustSummary";
import PricingBadge from "@/components/catalog/PricingBadge";
import BadgeDisplay from "@/components/catalog/BadgeDisplay";
import ListingGrid from "@/components/catalog/ListingGrid";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Listing Not Found | SassyMartie",
    };
  }

  return {
    title: `${listing.name} | SassyMartie`,
    description: listing.tagline,
    openGraph: {
      title: `${listing.name} | SassyMartie`,
      description: listing.tagline,
      type: "website",
      url: `https://sassymartie.com/${slug}`,
      images: ["/brand/logo.png"],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  // Next.js 15+ 'use cache' directive (if supported by this version)
  // For now, we'll use the conceptual implementation
  // cacheTag(slug, 'listing'); 

  const moreFromBuilder = await getListerListings(listing.lister_id);
  const otherTools = moreFromBuilder.filter(t => t.slug !== slug).slice(0, 3);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": listing.name,
    "description": listing.tagline,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": listing.pricing_model === "free" ? "0" : "7.00",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": listing.lister.display_name || listing.lister.username
    }
  };

  return (
    <div className="flex-1 bg-brand-white/50">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-brand-grey hover:text-brand-red transition-colors mb-8 font-ui font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to shelves
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <PricingBadge model={listing.pricing_model} />
              <span className="text-brand-grey font-ui text-sm">Listed on {new Date(listing.published_at).toLocaleDateString()}</span>
            </div>

            <h1 className="text-5xl md:text-6xl mb-6">{listing.name}</h1>
            <p className="text-xl md:text-2xl text-brand-charcoal/80 mb-8 leading-relaxed font-ui italic">
              &quot;{listing.tagline}&quot;
            </p>

            <div className="prose prose-brand max-w-none mb-12">
              <p className="text-lg leading-relaxed">
                {/* We'd normally have a description here, using tagline as placeholder if empty */}
                {listing.description || listing.tagline}
              </p>
            </div>

            {/* Trust Signal Section */}
            <div className="card-peach p-8 rounded-xl border border-brand-red/10 mb-12">
              <h3 className="font-heading text-2xl mb-4 text-brand-red">Trust Signal</h3>
              <TrustSummary 
                status={listing.trust?.qa_status || "unverified"} 
                deadline={listing.trust?.active_grace_deadline} 
              />
              <div className="mt-6 border-t border-brand-red/10 pt-6">
                <h4 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-3">Active Badges</h4>
                <div className="flex flex-wrap gap-3">
                  {listing.trust?.active_badges?.length > 0 ? (
                    <BadgeDisplay badges={listing.trust.active_badges} />
                  ) : (
                    <p className="text-sm text-brand-grey italic">No badges awarded yet. Verification in progress.</p>
                  )}
                </div>
              </div>
            </div>

            {/* More from builder */}
            {otherTools.length > 0 && (
              <div className="mt-20">
                <h3 className="font-heading text-2xl mb-8">More from this Builder</h3>
                <ListingGrid listings={otherTools} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="card sticky top-24 border-2 border-brand-red/20 shadow-xl p-8">
              <a 
                href={listing.external_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary w-full py-4 text-xl flex items-center justify-center gap-2 mb-6"
              >
                Visit Tool <ExternalLink className="w-5 h-5" />
              </a>

              <div className="space-y-6">
                <div className="border-b border-brand-grey/10 pb-4">
                  <h4 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-2">The Builder</h4>
                  <Link href={`/${listing.lister.username}`} className="group flex items-center gap-3">
                    {listing.lister.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.lister.avatar_url} alt={listing.lister.username} className="w-10 h-10 rounded-full border border-brand-peach" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-peach/30 flex items-center justify-center font-display text-brand-red">
                        {listing.lister.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold font-heading group-hover:text-brand-red transition-colors">
                        {listing.lister.display_name || listing.lister.username}
                      </div>
                      <div className="text-xs text-brand-grey font-ui">@{listing.lister.username}</div>
                    </div>
                  </Link>
                </div>

                <div>
                  <h4 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-2">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag tag-outline">SaaS</span>
                    <span className="tag tag-outline">Productivity</span>
                  </div>
                </div>

                {listing.lister.website_url && (
                  <div className="pt-4 flex gap-4">
                    <a href={listing.lister.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-grey hover:text-brand-red">
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
