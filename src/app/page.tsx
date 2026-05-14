import React from "react";
import { Search, Terminal, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { getListings } from "@/lib/catalog";
import ListingGrid from "@/components/catalog/ListingGrid";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    pricing?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const listings = await getListings({
    search: params.q,
    pricing_model: params.pricing,
  });

  return (
    <div className="flex-1">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="mb-6 leading-tight">
            The Thrift Store <br/> for Software.
          </h1>
          <p className="text-xl mb-8 leading-relaxed text-brand-charcoal/80">
            No VC. No pitch. Just code. Find the exact tool you need for $7/month, or list your entire portfolio for pennies.
          </p>

          <form action="/" method="GET" className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="What do people call it?"
                className="form-input pl-10 h-[46px]"
              />
            </div>
            <button type="submit" className="btn btn-secondary w-full sm:w-auto h-[46px]">
              Search
            </button>
          </form>
        </div>

        {/* Catalog Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-heading mb-1">Browse the Shelves</h2>
              <p className="text-brand-grey font-ui text-sm">Everything that&apos;s currently live and verified.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className={`tag ${!params.pricing ? 'tag-red' : 'tag-outline'}`}>All</Link>
              <Link href="/?pricing=free" className={`tag ${params.pricing === 'free' ? 'tag-red' : 'tag-outline'}`}>Free</Link>
              <Link href="/?pricing=freemium" className={`tag ${params.pricing === 'freemium' ? 'tag-red' : 'tag-outline'}`}>Freemium</Link>
              <Link href="/?pricing=paid" className={`tag ${params.pricing === 'paid' ? 'tag-red' : 'tag-outline'}`}>Paid</Link>
            </div>
          </div>

          <ListingGrid listings={listings} />
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 border-t border-brand-grey/10 pt-20">
          <div className="card">
            <div className="w-12 h-12 bg-brand-peach rounded flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-brand-charcoal" />
            </div>
            <h3 className="mb-2 font-heading">Ship Your Slop</h3>
            <p className="text-brand-charcoal/80 text-sm font-ui">
              Built a tool in a weekend? If it solves a real problem, it belongs here. Functional slop to polished gems are all welcome.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-brand-coral/10 rounded flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-brand-coral" />
            </div>
            <h3 className="mb-2 font-heading">Own Your Portfolio</h3>
            <p className="text-brand-charcoal/80 text-sm font-ui">
              Don&apos;t let your forgotten side-projects die. SassyMartie acts as the cross-promotion profile page for all the tools you&apos;ve built.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-brand-red/10 rounded flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="mb-2 font-heading">Find the Diamonds</h3>
            <p className="text-brand-charcoal/80 text-sm font-ui">
              We are a curated-ish dumping ground. Sometimes you find a Rolex between the broken toasters. That&apos;s the thrill of the hunt.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="card-peach p-8 md:p-12 text-center rounded">
          <h2 className="text-3xl md:text-4xl mb-4 text-brand-red font-heading">Ready to start digging?</h2>
          <p className="text-brand-charcoal/80 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Too many ideas, not enough time. We know. Whether you&apos;re a founder with 5 half-alive projects or looking for a tool that just works—you&apos;re in the right place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
             <Link href="/explore" className="btn btn-secondary btn-lg bg-brand-white">
              Browse all
            </Link>
             <Link href="/list-tool" className="btn btn-primary btn-lg">
              List your tool
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-grey/20 bg-brand-white mt-auto py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="font-display text-2xl text-brand-charcoal">SassyMartie</span>
          </div>
          <p className="text-brand-grey text-sm mb-6 max-w-sm mx-auto font-ui">
            The Slop Shop™ — Built with heart, chaos, and caffeine ♡
          </p>
          <div className="text-brand-grey text-sm font-ui font-bold flex justify-center gap-6">
            <Link href="#" className="hover:text-brand-charcoal transition-colors">Terms</Link>
            <Link href="#" className="hover:text-brand-charcoal transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-charcoal transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
