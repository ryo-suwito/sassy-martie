import React from 'react';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

interface BadgeDisplayProps {
  badges: string[];
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.includes('FULLY_FUNCTIONAL') && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-ui text-brand-charcoal bg-brand-peach/30 px-2 py-0.5 rounded border border-brand-peach/50" title="Fully Functional">
          <Zap className="w-3 h-3 text-brand-red" />
          FUNCTIONAL
        </span>
      )}
      {badges.includes('SECURITY_VERIFIED') && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-ui text-brand-charcoal bg-brand-coral/10 px-2 py-0.5 rounded border border-brand-coral/30" title="Security Verified">
          <ShieldCheck className="w-3 h-3 text-brand-coral" />
          SECURE
        </span>
      )}
      {badges.includes('TASTE_APPROVED') && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-ui text-brand-charcoal bg-brand-red/10 px-2 py-0.5 rounded border border-brand-red/20" title="Taste Approved">
          <Heart className="w-3 h-3 text-brand-red fill-brand-red" />
          TASTE
        </span>
      )}
    </div>
  );
}
