
import { NextResponse } from 'next/server';

function authenticateClave(clave: string): boolean | null {
  const passGuadalupe = process.env.CLAVE_FUNERARIA_GUADALUPE || 'Guadalupe25!';
  const passRamon = process.env.CLAVE_FUNERARIA_RAMON || 'Ramon25!';
  if (clave === passGuadalupe) return true;
  if (clave === passRamon) return false;
  return null;
}

export async function POST(req: Request) {
  const { clave } = await req.json();
  const isGuadalupe = authenticateClave(clave);
  if (isGuadalupe === null) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const res = NextResponse.json({ success: true, isGuadalupe });
  res.cookies.set('auth_funeraria', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.cookies.set('isGuadalupe', String(isGuadalupe), {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
