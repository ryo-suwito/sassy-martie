import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool } from "@/utils/tools";
import Navbar from "@/components/ui/Navbar";
import { Terminal } from "lucide-react";
import UtilityClient from "./UtilityClient";

interface UtilityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: UtilityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return { title: "Utility Not Found | SassyMartie" };
  }

  return {
    title: `${tool.name} | SassyMartie Utilities`,
    description: tool.tagline,
    openGraph: {
      title: `${tool.name} | SassyMartie Utilities`,
      description: tool.tagline,
      images: ["/brand/logo.png"],
    },
  };
}

export default async function UtilityPage({ params }: UtilityPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="flex-1 bg-brand-white">
      <Navbar />
      
      <div className="bg-brand-charcoal py-8 border-b border-brand-red/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-red p-1.5 rounded">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span className="text-brand-peach font-ui font-bold text-sm tracking-widest uppercase">Internal Utility</span>
          </div>
          <h1 className="text-white text-4xl md:text-5xl">{tool.name}</h1>
          <p className="text-brand-grey text-lg mt-2 font-ui">{tool.tagline}</p>
        </div>
      </div>

      <main className="min-h-[600px] flex flex-col">
        <UtilityClient slug={slug} />
      </main>

      <div className="bg-brand-peach/20 border-t border-brand-red/10 py-12 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-heading mb-4">About this Utility</h2>
          <p className="text-brand-charcoal/80 leading-relaxed font-ui">
            {tool.description} This is an internal tool built by the SassyMartie team. It runs entirely in your browser—no data ever leaves your machine.
          </p>
        </div>
      </div>
    </div>
  );
}
