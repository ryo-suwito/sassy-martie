import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { TOOLS } from '@/utils/tools'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sassymartie.com'

  // fetch dynamic tools from DB (if they exist there)
  const supabase = await createClient()
  const { data: dbTools } = await supabase.from('tools').select('id, updated_at')
  
  const dbToolUrls = (dbTools || []).map((tool) => ({
    url: `${baseUrl}/tools/${tool.id}`, // Assuming ID is the slug for now
    lastModified: new Date(tool.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Add internal tools from registry
  const internalToolUrls = Object.values(TOOLS).map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/list-tool`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...dbToolUrls,
    ...internalToolUrls,
  ]
}
