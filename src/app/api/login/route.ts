import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { clave } = await req.json()
  const PASSWORD = process.env.CLAVE_FUNERARIA || 'Guadalupe25!'

  if (clave === PASSWORD) {
    // Establecer cookie manualmente con cookies()
    cookies().set({
      name: 'auth_funeraria',
      value: 'true',
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json({ success: true })
  }

  return new NextResponse('Unauthorized', { status: 401 })
}
