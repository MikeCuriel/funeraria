// app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // Borra cookie httpOnly de autenticación
  res.cookies.set('auth_funeraria', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // (Opcional) también borra 'isGuadalupe' por si la seteaste en server alguna vez
  res.cookies.set('isGuadalupe', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}
