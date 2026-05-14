'use client'

import { useActionState } from 'react'
import { signup } from '../actions'
import Link from 'next/link'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, {})

  if (state.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-3xl font-bold text-indigo-600">Check your email</h1>
          <p className="mt-4 text-gray-600">
            We&apos;ve sent a magic link to your email. Click it to finish setting up your account.
          </p>
          <div className="mt-6">
            <Link href="/auth/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Join the Committee</h1>
          <p className="mt-2 text-sm text-gray-600">Build something great. Martie will help.</p>
        </div>
        
        <form action={formAction} className="mt-8 space-y-6">
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
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {state.error as string}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
