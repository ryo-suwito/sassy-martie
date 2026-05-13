"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { getTool } from "@/utils/tools";

interface ToolLayoutProps {
  toolId: string;
  children: React.ReactNode;
}

export default function ToolLayout({ toolId, children }: ToolLayoutProps) {
  const tool = getTool(toolId);

  if (!tool) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-display text-brand-red mb-4">Tool Not Found</h1>
        <p className="text-brand-charcoal/80 mb-8">Martie couldn&apos;t find that specific shovel.</p>
        <Link href="/" className="btn btn-primary">Back to Hub</Link>
      </div>
    );
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sassymartie.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://sassymartie.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: `https://sassymartie.com${tool.href}`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Navbar title={tool.name} showBack />
      
      {/* Tool Header - Common for all tools */}
      <header className="bg-brand-white border-b border-brand-grey/10 py-6 px-4">
        <div className="max-w-6xl mx-auto px-[15px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading mb-1">{tool.name}</h1>
              <p className="text-brand-charcoal/60 font-ui text-sm">{tool.tagline}</p>
            </div>
            <div className="text-right hidden md:block">
              <span className="tag tag-peach">Built by Martie</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="p-8 text-center text-brand-grey text-sm border-t border-brand-grey/10 mt-12">
        <p>&copy; {new Date().getFullYear()} SassyMartie — The Slop Shop™</p>
        <p className="mt-1 opacity-50 italic">Built with heart, chaos, and caffeine.</p>
      </footer>
    </div>
  );
}
