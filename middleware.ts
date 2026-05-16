import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get('auth_token')?.value
  if (!authToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next|favicon\\.ico|login|register).*)'],
}
