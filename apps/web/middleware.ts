import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/farmer', '/da', '/officer']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (!isProtected) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get('agri.session_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value

  if (!sessionToken) {
    const signInUrl = new URL('/signIn', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/farmer/:path*', '/da/:path*', '/officer/:path*'],
}
