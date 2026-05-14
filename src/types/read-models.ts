import { Database } from "@/utils/supabase/database.types";

export type ListingStatus = Database["public"]["Enums"]["listing_status"];
export type QAStatus = Database["public"]["Enums"]["qa_status"];
export type PricingModel = Database["public"]["Enums"]["pricing_model"];

export interface ListingCardModel {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricing_model: PricingModel;
  qa_status: QAStatus;
  active_badges: string[];
  active_grace_deadline: string | null;
  lister_username?: string;
}

export interface ListerProfileModel {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  avatar_url: string | null;
  tool_count: number;
}
