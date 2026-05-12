import { Search, ShoppingBag, Terminal, Sparkles, Database } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans">
      {/* Navigation */}
      <nav className="border-b border-[var(--color-brand-200)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[var(--color-accent-blue)]" />
            <span className="text-xl font-black tracking-tight text-[var(--color-brand-600)]">
              SassyMartie
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors">
              Log in
            </Link>
            <Link href="/list-tool" className="text-sm font-bold bg-[var(--color-accent-blue)] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm">
              List Your Slop
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[var(--color-brand-600)] mb-6 leading-tight">
            The Thrift Store <br/> for Software.
          </h1>
          <p className="text-xl text-[var(--color-brand-500)] mb-8 leading-relaxed">
            No enterprise gatekeeping. No mandatory demo calls. Just indie SaaS tools built by real people with real problems. Find the exact tool you need for $7/month, or list your entire portfolio for pennies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-brand-400)]" />
              <input
                type="text"
                placeholder="Search for inventory tools, AI writers, CRM..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[var(--color-brand-200)] focus:border-[var(--color-accent-blue)] focus:outline-none bg-white shadow-sm text-[var(--color-brand-600)]"
              />
            </div>
            <button className="w-full sm:w-auto bg-[var(--color-brand-600)] text-white px-8 py-3 rounded-lg font-bold hover:bg-[var(--color-brand-500)] transition-colors">
              Browse Tools
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-6 rounded-xl border border-[var(--color-brand-100)] shadow-sm">
            <div className="w-12 h-12 bg-[var(--color-accent-yellow-light)] rounded-lg flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-[var(--color-accent-yellow)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ship Your Slop</h3>
            <p className="text-[var(--color-brand-500)] text-sm">
              Built a tool in a weekend with an AI assistant? If it solves a real problem, it belongs here. Functional AI slop to polished indie gems are all welcome.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[var(--color-brand-100)] shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-[var(--color-accent-blue)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Own Your Portfolio</h3>
            <p className="text-[var(--color-brand-500)] text-sm">
              Don't let your forgotten side-projects die. SassyMartie acts as the cross-promotion profile page for all the tools you've built across different domains.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[var(--color-brand-100)] shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[var(--color-accent-green)]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Find the Diamonds</h3>
            <p className="text-[var(--color-brand-500)] text-sm">
              We are a curated-ish dumping ground. Sometimes you find a Rolex between the broken toasters. That's the thrill of the hunt. No pitch decks required.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[var(--color-brand-600)] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start digging?</h2>
          <p className="text-[var(--color-brand-200)] mb-8 max-w-2xl mx-auto">
            Whether you're an indie hacker with 5 half-alive projects or a small business owner looking for a tool that just works—you're in the right place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
             <Link href="/explore" className="bg-white text-[var(--color-brand-600)] px-6 py-3 rounded font-bold hover:bg-[var(--color-brand-50)] transition-colors">
              Explore Directory
            </Link>
             <Link href="/list-tool" className="bg-[var(--color-accent-blue)] text-white px-6 py-3 rounded font-bold hover:bg-blue-600 transition-colors border border-[var(--color-accent-blue)]">
              Submit a Tool
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-brand-200)] bg-white mt-12 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-[var(--color-brand-400)]" />
            <span className="text-lg font-black text-[var(--color-brand-400)]">SassyMartie</span>
          </div>
          <p className="text-[var(--color-brand-500)] text-sm mb-4">
            The Slop Shop™ — Founded in the post-AI era.
          </p>
          <div className="text-[var(--color-brand-400)] text-xs flex justify-center gap-4">
            <Link href="#" className="hover:text-[var(--color-brand-600)]">Terms</Link>
            <Link href="#" className="hover:text-[var(--color-brand-600)]">Privacy</Link>
            <Link href="#" className="hover:text-[var(--color-brand-600)]">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
