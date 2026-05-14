import { describe, it, expect, vi, beforeEach } from 'vitest'
import { claimUsername } from '@/actions/builder/claim-username'
import { getClaims } from '@/lib/auth/getClaims'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/auth/getClaims', () => ({
  getClaims: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('claimUsername Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject unauthenticated calls', async () => {
    vi.mocked(getClaims).mockResolvedValue(null)
    
    const formData = new FormData()
    formData.append('username', 'test-user')
    
    const result = await claimUsername({}, formData)
    expect(result.error).toContain('Not authenticated')
  })

  it('should reject invalid usernames', async () => {
    vi.mocked(getClaims).mockResolvedValue({ sub: 'user-123' })
    
    const formData = new FormData()
    formData.append('username', 'Invalid Name!')
    
    const result = await claimUsername({}, formData)
    expect(result.error).toBeDefined()
  })

  it('should reject duplicate usernames', async () => {
    vi.mocked(getClaims).mockResolvedValue({ sub: 'user-123' })
    
    const mockSupabase = {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'other-user' }, error: null }),
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient)
    
    const formData = new FormData()
    formData.append('username', 'taken-name')
    
    const result = await claimUsername({}, formData)
    expect(result.error).toContain('taken')
  })

  it('should successfully claim an available username', async () => {
    vi.mocked(getClaims).mockResolvedValue({ sub: 'user-123' })
    
    const mockSupabase = {
      schema: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }
    
    // First call to eq should return the mockSupabase (for .single() chaining)
    // Second call to eq (after update) should return the final result
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase)
      .mockResolvedValueOnce({ error: null })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as SupabaseClient)
    
    const formData = new FormData()
    formData.append('username', 'available-name')
    
    const result = await claimUsername({}, formData)
    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})
