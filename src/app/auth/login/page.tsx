'use client'

import { useActionState, Suspense } from 'react'
import { login } from '../actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
        <p className="mt-2 text-sm text-gray-600">Martie is waiting for you.</p>
      </div>
      
      <form action={formAction} className="mt-8 space-y-6">
        <input type="hidden" name="next" value={next} />
        
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        {state.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {typeof state.error === 'string' ? state.error : 'Something broke on our end. Martie is on it.'}
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="text-center text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
