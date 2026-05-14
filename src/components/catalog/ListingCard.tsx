import React from 'react';
import Link from 'next/link';
import { ListingCardModel } from '@/types/read-models';
import PricingBadge from './PricingBadge';
import BadgeDisplay from './BadgeDisplay';
import { ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: ListingCardModel;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isGracePeriod = listing.qa_status === 'grace_period';

  return (
    <Link 
      href={`/${listing.slug}`}
      className={`card group transition-all hover:shadow-lg block h-full ${
        isGracePeriod ? 'border-brand-red/30 bg-brand-peach/5' : 'hover:border-brand-red/20'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          <PricingBadge model={listing.pricing_model} />
          {isGracePeriod && (
            <span className="tag tag-red animate-pulse">Warning</span>
          )}
        </div>
        {listing.lister_username && (
          <span className="text-[10px] font-bold text-brand-grey font-ui uppercase tracking-tighter">
            by {listing.lister_username}
          </span>
        )}
      </div>

      <h3 className="mb-2 group-hover:text-brand-red transition-colors flex items-center justify-between">
        {listing.name}
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </h3>

      <p className="text-brand-charcoal/80 text-sm mb-4 line-clamp-2 leading-relaxed">
        {listing.tagline}
      </p>

      <div className="mt-auto">
        <BadgeDisplay badges={listing.active_badges} />
      </div>
    </Link>
  );
}
