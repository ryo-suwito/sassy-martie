import { describe, it, expect, vi, beforeEach } from 'vitest'
import sitemap from '@/app/sitemap'
import { createClient } from '@/utils/supabase/server'

describe('Sitemap', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('generates sitemap with static and dynamic routes', async () => {
    const mockListings = [{ slug: 'tool-1', updated_at: '2024-05-14T00:00:00Z' }]
    const mockEditorials = [{ id: 'edit-1', created_at: '2024-05-14T00:00:00Z' }]
    const mockListers = [{ username: 'martie' }]

    const supabase = await createClient()
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'listings') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: (cb: (val: unknown) => void) => cb({ data: mockListings, error: null })
        } as unknown as ReturnType<typeof supabase.from>
      }
      if (table === 'editorials') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: (cb: (val: unknown) => void) => cb({ data: mockEditorials, error: null })
        } as unknown as ReturnType<typeof supabase.from>
      }
      if (table === 'lister_profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          then: (cb: (val: unknown) => void) => cb({ data: mockListers, error: null })
        } as unknown as ReturnType<typeof supabase.from>
      }
      return {} as unknown as ReturnType<typeof supabase.from>
    })

    const result = await sitemap()
    
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ url: 'https://sassymartie.com' }),
      expect.objectContaining({ url: 'https://sassymartie.com/tool-1' }),
      expect.objectContaining({ url: 'https://sassymartie.com/editorial/edit-1' }),
      expect.objectContaining({ url: 'https://sassymartie.com/martie' }),
    ]))
  })
})
