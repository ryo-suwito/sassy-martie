"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Navbar({ 
  title = "SassyMartie", 
  showBack = false, 
  backHref = "/" 
}: NavbarProps) {
  return (
    <nav className="border-b border-brand-grey/20 bg-brand-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link 
              href={backHref} 
              className="flex items-center gap-2 text-brand-charcoal hover:text-brand-red transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-ui font-bold hidden sm:inline">Back</span>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-24 sm:w-28">
              <Image 
                src="/brand/logo.png" 
                alt="SassyMartie Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display text-3xl sm:text-4xl text-brand-red leading-none group-hover:text-brand-red-deep transition-colors hidden xs:inline">
              {title === "SassyMartie" ? "" : title}
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn btn-ghost">
            Sign in
          </Link>
          <Link href="/list-tool" className="btn btn-primary">
            List your tool
          </Link>
        </div>
      </div>
    </nav>
  );
}
