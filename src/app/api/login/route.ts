import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { clave } = await req.json()

  const passGuadalupe = process.env.CLAVE_FUNERARIA_GUADALUPE || 'Guadalupe25!'
  const passRamon = process.env.CLAVE_FUNERARIA_RAMON || 'Ramon25!'

  let isGuadalupe: boolean | null = null

  if (clave === passGuadalupe) {
    isGuadalupe = true
  } else if (clave === passRamon) {
    isGuadalupe = false
  }

  if (isGuadalupe === null) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const res = NextResponse.json({
    success: true,
    isGuadalupe,
  })

  res.cookies.set('auth_funeraria', "true", {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Aquí guardamos si es Guadalupe o Ramón
  res.cookies.set('isGuadalupe', String(isGuadalupe), {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}
