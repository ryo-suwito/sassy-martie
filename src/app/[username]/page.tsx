import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { getListerProfile, getListerListings } from "@/lib/catalog";
import ListingGrid from "@/components/catalog/ListingGrid";
import ListerProfileHeader from "@/components/catalog/ListerProfileHeader";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getListerProfile(username);

  if (!profile) {
    return {
      title: "Builder Not Found | SassyMartie",
    };
  }

  return {
    title: `${profile.display_name || profile.username}'s Portfolio | SassyMartie`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s software portfolio on SassyMartie.`,
    openGraph: {
      title: `${profile.display_name || profile.username}'s Portfolio | SassyMartie`,
      description: profile.bio || `Check out ${profile.display_name || profile.username}'s software portfolio on SassyMartie.`,
      images: [profile.avatar_url || "/brand/logo.png"],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getListerProfile(username);

  if (!profile) {
    notFound();
  }

  const listings = await getListerListings(profile.id);

  return (
    <div className="flex-1 bg-brand-white/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <ListerProfileHeader profile={profile} />

        <div className="mb-12">
          <h2 className="text-3xl font-heading mb-8 flex items-center gap-3">
            The Portfolio
            <span className="text-brand-grey font-ui text-base font-normal">({listings.length} live tools)</span>
          </h2>
          <ListingGrid listings={listings} />
        </div>

        {listings.length === 0 && (
          <div className="card-peach p-12 text-center rounded-xl border border-brand-red/10">
            <h3 className="text-2xl mb-4 font-heading text-brand-red">Nothing live yet.</h3>
            <p className="text-brand-charcoal/80 font-ui max-w-md mx-auto">
              This builder is probably deep in the lab, brewing something chaotic and beautiful. Check back soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
