import '@testing-library/jest-dom'
import { vi } from 'vitest'

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    range: vi.fn().mockReturnThis(),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getClaims: vi.fn().mockResolvedValue({ data: { claims: null }, error: null }),
  },
}

// Mock Supabase clients
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

export { mockSupabase }
