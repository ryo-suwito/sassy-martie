import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getListings, getListingBySlug, getListerProfile } from '@/lib/catalog'
import { createClient } from '@/utils/supabase/server'

describe('Catalog Library', () => {
  let supabase: any;

  beforeEach(async () => {
    vi.clearAllMocks()
    supabase = await createClient()
  })

  it('getListings fetches live listings with correct structure', async () => {
    const mockData = [
      {
        id: '1',
        slug: 'test-tool',
        name: 'Test Tool',
        tagline: 'A great tool',
        pricing_model: 'free',
        lister: { username: 'martie' },
        trust: { qa_status: 'passing', active_badges: ['SECURE'], active_grace_deadline: null }
      }
    ]

    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }
    supabase.from.mockReturnValue(queryMock)

    const listings = await getListings()
    
    expect(listings).toHaveLength(1)
    expect(listings[0].name).toBe('Test Tool')
    expect(listings[0].lister_username).toBe('martie')
  })

  it('getListingBySlug returns null when listing not found', async () => {
    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    }
    supabase.from.mockReturnValue(queryMock)

    const listing = await getListingBySlug('non-existent')
    expect(listing).toBeNull()
  })

  it('getListerProfile fetches profile and tool count', async () => {
    const mockProfile = { id: 'u1', username: 'martie', display_name: 'Martie Opossum' }
    
    supabase.from.mockImplementation((table: string) => {
      if (table === 'lister_profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
        }
      }
      if (table === 'listings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: (cb: any) => cb({ count: 5, error: null })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
    })

    const profile = await getListerProfile('martie')
    
    expect(profile).not.toBeNull()
    expect(profile?.username).toBe('martie')
    expect(profile?.tool_count).toBe(5)
  })
})
