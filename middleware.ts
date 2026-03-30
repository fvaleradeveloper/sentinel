import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/admin']
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return response
}
