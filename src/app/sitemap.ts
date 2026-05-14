import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = 'https://sassymartie.com';

  // 1. Fetch all live listings
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, updated_at')
    .eq('status', 'live');

  // 2. Fetch all published editorials
  const { data: editorials } = await supabase
    .from('editorials')
    .select('id, created_at') // Using ID as slug placeholder
    .eq('status', 'published');

  // 3. Fetch all listers with at least one live tool
  const { data: listers } = await supabase
    .from('lister_profiles')
    .select('username');
    // In a real app, we'd join with listings to only include active builders

  const staticRoutes = [
    '',
    '/explore',
    '/list-tool',
    '/utilities/precision-chopper',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const listingRoutes = (listings || []).map((l) => ({
    url: `${baseUrl}/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const editorialRoutes = (editorials || []).map((e) => ({
    url: `${baseUrl}/editorial/${e.id}`,
    lastModified: new Date(e.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const profileRoutes = (listers || []).map((p) => ({
    url: `${baseUrl}/${p.username}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...editorialRoutes, ...profileRoutes];
}
