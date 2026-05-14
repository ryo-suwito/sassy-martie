import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('getClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return claims when session is valid', async () => {
    const mockClaims = { sub: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: mockClaims },
          error: null,
        }),
      },
    }
    
    // @ts-expect-error - mocking supabase client
    vi.mocked(createClient).mockResolvedValue(mockSupabase)

    const result = await getClaims()
    expect(result).toEqual(mockClaims)
  })

  it('should return null when no claims are returned', async () => {
    const mockSupabase = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: null },
          error: null,
        }),
      },
    }
    
    // @ts-expect-error - mocking supabase client
    vi.mocked(createClient).mockResolvedValue(mockSupabase)

    const result = await getClaims()
    expect(result).toBeNull()
  })

  it('should return null on error', async () => {
    const mockSupabase = {
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Auth error' },
        }),
      },
    }
    
    // @ts-expect-error - mocking supabase client
    vi.mocked(createClient).mockResolvedValue(mockSupabase)

    const result = await getClaims()
    expect(result).toBeNull()
  })

  it('should return null on exception', async () => {
    vi.mocked(createClient).mockRejectedValue(new Error('Network error'))

    const result = await getClaims()
    expect(result).toBeNull()
  })
})
