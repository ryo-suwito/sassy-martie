import { Search, Terminal, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

export default function Home() {
  return (
    <div className="flex-1">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="mb-6 leading-tight">
            The Thrift Store <br/> for Software.
          </h1>
          <p className="text-xl mb-8 leading-relaxed text-brand-charcoal/80">
            No VC. No pitch. Just code. Find the exact tool you need for $7/month, or list your entire portfolio for pennies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey" />
              <input
                type="text"
                placeholder="What do people call it?"
                className="form-input pl-10 h-[46px]"
              />
            </div>
            <button className="btn btn-secondary w-full sm:w-auto h-[46px]">
              Browse tools
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="card">
            <div className="w-12 h-12 bg-brand-peach rounded flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-brand-charcoal" />
            </div>
            <h3 className="mb-2">Ship Your Slop</h3>
            <p className="text-brand-charcoal/80 text-sm">
              Built a tool in a weekend? If it solves a real problem, it belongs here. Functional slop to polished gems are all welcome.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-brand-coral/10 rounded flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-brand-coral" />
            </div>
            <h3 className="mb-2">Own Your Portfolio</h3>
            <p className="text-brand-charcoal/80 text-sm">
              Don&apos;t let your forgotten side-projects die. SassyMartie acts as the cross-promotion profile page for all the tools you&apos;ve built.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-brand-red/10 rounded flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-brand-red" />
            </div>
            <h3 className="mb-2">Find the Diamonds</h3>
            <p className="text-brand-charcoal/80 text-sm">
              We are a curated-ish dumping ground. Sometimes you find a Rolex between the broken toasters. That&apos;s the thrill of the hunt.
            </p>
          </div>
        </div>

        {/* Featured Card Example */}
        <div className="max-w-3xl mx-auto mb-20">
          <h3 className="mb-6 text-center">Trending right now</h3>
          <div className="card border-brand-red/20 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 mb-3">
                  <span className="tag tag-red">AI</span>
                  <span className="tag tag-peach">Productivity</span>
                  <span className="tag tag-outline">Free</span>
                </div>
                <h2>ShipFast Pro</h2>
              </div>
              <span className="tag tag-coral">Featured ♡</span>
            </div>
            <p className="text-brand-charcoal/80 mb-6">
              Boilerplate for indie hackers who need to ship in a weekend, not a quarter. Auth, billing, database — done. Built by a solo founder over one weekend. Simple. It works.
            </p>
            <div className="flex items-center justify-between">
              <button className="btn btn-secondary btn-sm">See how it works</button>
              <div className="flex gap-4 text-brand-grey text-xs font-ui">
                <span>Listed 3 days ago</span>
                <span>47 views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="card-peach p-8 md:p-12 text-center rounded">
          <h2 className="text-3xl md:text-4xl mb-4 text-brand-red font-heading">Ready to start digging?</h2>
          <p className="text-brand-charcoal/80 mb-8 max-w-2xl mx-auto text-lg">
            Too many ideas, not enough time. We know. Whether you&apos;re a founder with 5 half-alive projects or looking for a tool that just works—you&apos;re in the right place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
             <Link href="/explore" className="btn btn-secondary btn-lg bg-brand-white">
              Browse tools
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
          <p className="text-brand-grey text-sm mb-6 max-w-sm mx-auto">
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