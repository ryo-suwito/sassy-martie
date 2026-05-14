import React from 'react';
import { ListerProfileModel } from '@/types/read-models';
import { Globe, Twitter } from 'lucide-react';

interface ListerProfileHeaderProps {
  profile: ListerProfileModel;
}

export default function ListerProfileHeader({ profile }: ListerProfileHeaderProps) {
  return (
    <div className="bg-brand-white border border-brand-grey/10 rounded-xl p-8 mb-12 shadow-sm">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={profile.avatar_url} 
            alt={profile.display_name || profile.username} 
            className="w-32 h-32 rounded-full border-4 border-brand-peach object-cover"
          />
        ) : (
          <div className="w-32 h-32 rounded-full border-4 border-brand-peach bg-brand-peach/20 flex items-center justify-center text-4xl font-display text-brand-red">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
            <h1 className="text-4xl">{profile.display_name || profile.username}</h1>
            <span className="text-brand-grey font-ui text-lg">@{profile.username}</span>
          </div>

          <p className="text-brand-charcoal/80 text-lg mb-6 leading-relaxed max-w-2xl">
            {profile.bio || "Just another builder shipping slop and finding diamonds."}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 font-ui text-sm font-bold text-brand-grey">
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-red transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
            {profile.twitter_handle && (
              <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-red transition-colors">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
            )}
            <div className="flex items-center gap-2 text-brand-charcoal">
              <span className="bg-brand-red text-white px-2 py-0.5 rounded text-[10px]">{profile.tool_count}</span>
              Tools Listed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
