import React from "react";
import Navbar from "@/components/ui/Navbar";
import { getListings } from "@/lib/catalog";
import ListingGrid from "@/components/catalog/ListingGrid";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    pricing?: string;
    badge?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const listings = await getListings({
    search: params.q,
    pricing_model: params.pricing,
  });

  // Client-side badge filtering would happen here if we had more listings
  // For now, we'll just filter the results we got
  const filteredListings = params.badge 
    ? listings.filter(l => l.active_badges.includes(params.badge!))
    : listings;

  return (
    <div className="flex-1 bg-brand-white/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-4 font-heading">Explore the Catalog</h1>
          <p className="text-brand-grey font-ui text-lg italic">
            &quot;The internet&apos;s lost and found. Mostly found.&quot; — Martie ♡
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            <form action="/explore" method="GET" className="space-y-6">
              <div>
                <h3 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-3 flex items-center gap-2">
                  <Search className="w-3 h-3" /> Search
                </h3>
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={params.q}
                  placeholder="Tool name..." 
                  className="form-input text-sm"
                />
              </div>

              <div>
                <h3 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-3 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Pricing
                </h3>
                <div className="space-y-2">
                  {['free', 'freemium', 'paid'].map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="pricing" 
                        value={p}
                        defaultChecked={params.pricing === p}
                        className="accent-brand-red"
                      />
                      <span className="text-sm font-ui group-hover:text-brand-red transition-colors capitalize">{p}</span>
                    </label>
                  ))}
                  <Link href="/explore" className="text-[10px] text-brand-grey hover:text-brand-red underline block pt-1">Clear pricing</Link>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold font-ui uppercase tracking-widest text-brand-grey mb-3">Trust Signal</h3>
                <div className="space-y-2">
                  {[
                    { id: 'FULLY_FUNCTIONAL', label: 'Functional' },
                    { id: 'SECURITY_VERIFIED', label: 'Secure' },
                    { id: 'TASTE_APPROVED', label: 'Taste Approved' },
                  ].map((b) => (
                    <Link 
                      key={b.id}
                      href={`/explore?${new URLSearchParams({ ...params, badge: b.id }).toString()}`}
                      className={`block text-sm font-ui hover:text-brand-red transition-colors ${params.badge === b.id ? 'text-brand-red font-bold' : ''}`}
                    >
                      {b.label}
                    </Link>
                  ))}
                  {params.badge && (
                    <Link href="/explore" className="text-[10px] text-brand-grey hover:text-brand-red underline block pt-1">Clear badge</Link>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-secondary w-full py-2 text-sm">
                Apply Filters
              </button>
            </form>
          </aside>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-brand-grey font-ui">Showing {filteredListings.length} results</span>
            </div>
            <ListingGrid listings={filteredListings} />
          </div>
        </div>
      </main>
    </div>
  );
}
