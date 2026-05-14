import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, User } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { getEditorialBySlug } from "@/lib/catalog";
import ListingCard from "@/components/catalog/ListingCard";

interface EditorialPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const editorial = await getEditorialBySlug(slug);

  if (!editorial) {
    return { title: "Editorial Not Found | SassyMartie" };
  }

  return {
    title: `${editorial.title} | SassyMartie Editorial`,
    description: `Deep dive into ${editorial.listing.name}: ${editorial.title}`,
    openGraph: {
      title: editorial.title,
      description: `Deep dive into ${editorial.listing.name}`,
      type: "article",
      images: ["/brand/logo.png"],
    },
  };
}

export default async function EditorialPage({ params }: EditorialPageProps) {
  const { slug } = await params;
  const editorial = await getEditorialBySlug(slug);

  if (!editorial) {
    notFound();
  }

  return (
    <div className="flex-1 bg-brand-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link 
          href={`/${editorial.listing.slug}`} 
          className="inline-flex items-center gap-2 text-brand-grey hover:text-brand-red transition-colors mb-8 font-ui font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {editorial.listing.name}
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="tag tag-red uppercase tracking-widest">{editorial.type}</span>
            <span className="text-brand-grey font-ui text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(editorial.published_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl mb-6 leading-tight">{editorial.title}</h1>
          <div className="flex items-center gap-2 text-brand-grey font-ui">
            <User className="w-4 h-4" />
            <span className="font-bold">Martie Editorial Team</span>
          </div>
        </header>

        <div className="prose prose-brand lg:prose-xl max-w-none mb-20 font-ui leading-relaxed">
          {/* In a real app, we'd render MDX here. For now, just the raw text. */}
          <div className="whitespace-pre-wrap">{editorial.body_mdx}</div>
        </div>

        {/* Call to Action: The Tool */}
        <div className="border-t border-brand-grey/10 pt-12">
          <h3 className="text-2xl font-heading mb-8 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-red" />
            About the Tool
          </h3>
          <div className="max-w-md">
            <ListingCard listing={{
              id: editorial.listing.id,
              slug: editorial.listing.slug,
              name: editorial.listing.name,
              tagline: editorial.listing.tagline,
              pricing_model: editorial.listing.pricing_model,
              qa_status: "passing", // placeholder
              active_badges: [], // placeholder
              active_grace_deadline: null
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}
