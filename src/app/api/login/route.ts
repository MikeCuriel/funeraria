import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { clave } = await req.json()
  const PASSWORD = process.env.CLAVE_FUNERARIA || 'Guadalupe25!'

  if (clave === PASSWORD) {
    const res = NextResponse.json({ success: true })

    res.cookies.set('auth_funeraria', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return res
  }

  return new NextResponse('Unauthorized', { status: 401 })
}
