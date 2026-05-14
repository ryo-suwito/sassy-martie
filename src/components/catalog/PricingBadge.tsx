import React from 'react';
import { PricingModel } from '@/types/read-models';

interface PricingBadgeProps {
  model: PricingModel;
}

export default function PricingBadge({ model }: PricingBadgeProps) {
  const getStyle = (m: PricingModel) => {
    switch (m) {
      case 'free':
        return 'tag-outline';
      case 'paid':
        return 'tag-red';
      case 'freemium':
        return 'tag-peach';
      case 'contact':
        return 'tag-grey';
      default:
        return 'tag-outline';
    }
  };

  return (
    <span className={`tag ${getStyle(model)}`}>
      {model.charAt(0).toUpperCase() + model.slice(1)}
    </span>
  );
}
