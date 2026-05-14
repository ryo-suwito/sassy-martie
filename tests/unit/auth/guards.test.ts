import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, requireRole, requireTaster } from '@/lib/auth/guards'
import { getClaims, UserClaims } from '@/lib/auth/getClaims'
import { redirect } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'

vi.mock('@/lib/auth/getClaims', () => ({
  getClaims: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireAuth', () => {
    it('should return claims if authenticated', async () => {
      const mockClaims: UserClaims = { sub: 'user-123' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      const result = await requireAuth()
      expect(result).toEqual(mockClaims)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should redirect if not authenticated', async () => {
      vi.mocked(getClaims).mockResolvedValue(null)

      await requireAuth()
      expect(redirect).toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('requireRole', () => {
    it('should return claims if role matches', async () => {
      const mockClaims: UserClaims = { sub: 'user-123', user_role: 'backoffice' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      const result = await requireRole({} as unknown as SupabaseClient, 'backoffice')
      expect(result).toEqual(mockClaims)
    })

    it('should throw 403 error if role does not match', async () => {
      const mockClaims: UserClaims = { sub: 'user-123', user_role: 'lister' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      await expect(requireRole({} as unknown as SupabaseClient, 'backoffice')).rejects.toThrow('403: Forbidden - Insufficient Permissions')
    })
  })

  describe('requireTaster', () => {
    it('should return claims if user is an active taster', async () => {
      const mockClaims: UserClaims = { sub: 'user-123' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      const mockSupabase = {
        schema: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { status: 'active' },
          error: null,
        }),
      }

      const result = await requireTaster(mockSupabase as unknown as SupabaseClient)
      expect(result).toEqual(mockClaims)
    })

    it('should throw 403 if user is not an active taster', async () => {
      const mockClaims: UserClaims = { sub: 'user-123' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      const mockSupabase = {
        schema: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { status: 'suspended' },
          error: null,
        }),
      }

      await expect(requireTaster(mockSupabase as unknown as SupabaseClient)).rejects.toThrow('403: Forbidden - Active Taster Status Required')
    })

    it('should throw 403 if taster record not found', async () => {
      const mockClaims: UserClaims = { sub: 'user-123' }
      vi.mocked(getClaims).mockResolvedValue(mockClaims)

      const mockSupabase = {
        schema: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

      await expect(requireTaster(mockSupabase as unknown as SupabaseClient)).rejects.toThrow('403: Forbidden - Active Taster Status Required')
    })
  })
})
