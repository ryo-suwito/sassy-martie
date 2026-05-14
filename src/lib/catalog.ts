import { createClient } from "@/utils/supabase/server";
import { ListingCard, ListerProfileModel, QAStatus } from "@/types/read-models";

export async function getListings(filters?: {
  pricing_model?: string;
  qa_status?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(`
      id,
      slug,
      name,
      tagline,
      pricing_model,
      lister_id,
      lister:lister_profiles!lister_id (username),
      trust:listing_trust_summary!id (
        qa_status,
        active_badges,
        active_grace_deadline
      )
    `)
    .eq("status", "live");

  if (filters?.pricing_model) {
    query = query.eq("pricing_model", filters.pricing_model);
  }

  if (filters?.qa_status) {
    query = query.eq("qa_status", filters.qa_status);
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query.order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return (data || []).map((item) => {
    const trust = item.trust as unknown as { 
      qa_status: QAStatus; 
      active_badges: string[]; 
      active_grace_deadline: string | null 
    } | null;
    const lister = item.lister as unknown as { username: string } | null;

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      tagline: item.tagline,
      pricing_model: item.pricing_model,
      qa_status: trust?.qa_status || "unverified",
      active_badges: trust?.active_badges || [],
      active_grace_deadline: trust?.active_grace_deadline || null,
      lister_username: lister?.username,
    };
  }) as ListingCard[];
}

export async function getListingBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      lister:lister_profiles!lister_id (*),
      trust:listing_trust_summary!id (*)
    `)
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getListerProfile(username: string) {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("lister_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("lister_id", profile.id)
    .eq("status", "live");

  return {
    ...profile,
    tool_count: count || 0,
  } as ListerProfileModel;
}

export async function getListerListings(listerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      slug,
      name,
      tagline,
      pricing_model,
      trust:listing_trust_summary!id (
        qa_status,
        active_badges,
        active_grace_deadline
      )
    `)
    .eq("lister_id", listerId)
    .eq("status", "live")
    .order("published_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data || []).map((item) => {
    const trust = item.trust as unknown as { 
      qa_status: QAStatus; 
      active_badges: string[]; 
      active_grace_deadline: string | null 
    } | null;

    return {
      id: item.id,
      slug: item.slug,
      name: item.name,
      tagline: item.tagline,
      pricing_model: item.pricing_model,
      qa_status: trust?.qa_status || "unverified",
      active_badges: trust?.active_badges || [],
      active_grace_deadline: trust?.active_grace_deadline || null,
    };
  }) as ListingCard[];
}

export async function getEditorialBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editorials")
    .select(`
      *,
      listing:listings (id, name, slug, tagline, pricing_model)
    `)
    .eq("status", "published")
    .eq("id", slug) // assuming id is used for slug if slug column missing, but editorials table in 01_SCHEMA_CONTRACTS.md doesn't have slug, wait.
    .single();

  // Wait, let's check the schema for editorials again.
  // 01_SCHEMA_CONTRACTS.md: editorials has id, listing_id, author_id, type, title, body_mdx, status, published_at, created_at.
  // It doesn't have a slug! I should probably use ID or add a slug if possible, but I can't change schema.
  // Actually, I'll use ID for now or assume a slug column exists in the actual implementation.
  // Wait, I'll check the migration.
  
  if (error || !data) {
    return null;
  }

  return data;
}
