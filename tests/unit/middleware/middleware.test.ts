import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateSession } from '@/utils/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  
  const mockResponse = (init?: ResponseInit) => ({
    status: init?.status || 200,
    cookies: {
      getAll: vi.fn().mockReturnValue([{ name: 'sb-auth-token', value: 'mock-token' }]),
      set: vi.fn(),
    },
  })

  function MockNextResponse(body?: BodyInit | null, init?: ResponseInit) {
    return mockResponse(init)
  }

  MockNextResponse.next = vi.fn().mockReturnValue(mockResponse())
  MockNextResponse.redirect = vi.fn().mockImplementation((url) => ({
    ...mockResponse(),
    url,
  }))

  return {
    ...actual,
    NextResponse: MockNextResponse,
  }
})

describe('Middleware updateSession', () => {
  const mockUrl = 'http://localhost:3000'
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should refresh session and allow public routes', async () => {
    const request = new NextRequest(new URL('/', mockUrl))
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    expect(response).toBeDefined()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('should redirect /dashboard to /auth/login if not authenticated', async () => {
    const request = new NextRequest(new URL('/dashboard', mockUrl))
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/auth/login',
    }))
    expect(response.cookies.set).toHaveBeenCalledWith('sb-auth-token', 'mock-token', expect.anything())
  })

  it('should redirect /dashboard to onboarding if username is null', async () => {
    const request = new NextRequest(new URL('/dashboard', mockUrl))
    const mockUser = { id: 'user-123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { username: null }, error: null }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/dashboard/onboarding',
    }))
    expect(response.cookies.set).toHaveBeenCalledWith('sb-auth-token', 'mock-token', expect.anything())
  })

  it('should allow /dashboard if authenticated and onboarding complete', async () => {
    const request = new NextRequest(new URL('/dashboard', mockUrl))
    const mockUser = { id: 'user-123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { username: 'martie' }, error: null }),
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    expect(NextResponse.redirect).not.toHaveBeenCalled()
    expect(response).toBeDefined()
  })

  it('should redirect /backoffice to /auth/login if not authenticated', async () => {
    const request = new NextRequest(new URL('/backoffice', mockUrl))
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/auth/login',
    }))
    expect(response.cookies.set).toHaveBeenCalledWith('sb-auth-token', 'mock-token', expect.anything())
  })

  it('should 403 /backoffice if user has no admin role', async () => {
    const request = new NextRequest(new URL('/backoffice', mockUrl))
    const mockUser = { id: 'user-123', app_metadata: { role: 'user' } }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    }
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any)

    const response = await updateSession(request)
    
    expect(response.status).toBe(403)
    expect(response.cookies.set).toHaveBeenCalledWith('sb-auth-token', 'mock-token', expect.anything())
  })
})
