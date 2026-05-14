import React from 'react';
import { ListingCard } from '@/types/read-models';
import ListingCardComponent from './ListingCard';

interface ListingGridProps {
  listings: ListingCard[];
}

export default function ListingGrid({ listings }: ListingGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-20 bg-brand-white rounded-xl border-2 border-dashed border-brand-grey/20">
        <p className="text-brand-grey font-ui">No tools found matching your search. Maybe try another shelf?</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCardComponent key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
