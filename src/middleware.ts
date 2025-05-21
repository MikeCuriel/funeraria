import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth_funeraria')?.value

  const isProtected = request.nextUrl.pathname.match(/^\/($|home|memoriales|contenido)/)

  if (isProtected && auth !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/home/:path*', '/memoriales/:path*', '/contenido/:path*'],
}
