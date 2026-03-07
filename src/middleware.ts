import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/oauth-callback', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const tokenValue = request.cookies.get('finanzapp_token')?.value
  const token = tokenValue?.trim() || null

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
