import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 2. Protect /dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/auth/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie)
      })
      return response
    }

    // Onboarding check: IF valid session BUT onboarding incomplete → redirect to /dashboard/onboarding
    if (url.pathname !== '/dashboard/onboarding') {
      const { data: profile } = await supabase
        .from('lister_profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (!profile || profile.username === null) {
        url.pathname = '/dashboard/onboarding'
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value, cookie)
        })
        return response
      }
    }
  }

  // 3. Protect /backoffice routes
  if (url.pathname.startsWith('/backoffice')) {
    if (!user) {
      url.pathname = '/auth/login'
      const response = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie)
      })
      return response
    }

    const role = user.app_metadata?.role || user.role
    const isBackoffice = ['backoffice_admin', 'backoffice_reviewer', 'backoffice'].includes(role)

    if (!isBackoffice) {
      const response = new NextResponse('403 Forbidden', { status: 403 })
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie)
      })
      return response
    }
  }

  return supabaseResponse
}
