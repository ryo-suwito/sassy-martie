import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConfig } from '@/lib/config/systemConfig'
import { createClient } from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('systemConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return config value for a valid key', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { value: '48' },
        error: null,
      }),
    }
    
    // @ts-expect-error - mocking supabase client
    vi.mocked(createClient).mockResolvedValue(mockSupabase)

    const result = await getConfig('grace_period_hours')
    expect(result).toBe('48')
    expect(mockSupabase.from).toHaveBeenCalledWith('system_config')
    expect(mockSupabase.eq).toHaveBeenCalledWith('key', 'grace_period_hours')
  })

  it('should return empty string and log warning if key is not found', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      }),
    }
    
    // @ts-expect-error - mocking supabase client
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await getConfig('grace_period_hours')
    expect(result).toBe('')
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('grace_period_hours'))
  })
})
