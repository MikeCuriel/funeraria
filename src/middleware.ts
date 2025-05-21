import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
 
  const auth = request.cookies.get('auth_funeraria')?.value

  // Rutas que requieren autenticación
  const protectedRoutes = ['/home', '/memoriales', '/contenido']

  const isProtected = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && auth !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/home', '/memoriales', '/contenido'], // puedes ajustar las rutas protegidas
}
