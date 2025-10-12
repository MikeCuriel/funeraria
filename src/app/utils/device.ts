'use client';

import Cookies from 'js-cookie';

export function getOrCreateInstallId() {
  let id = Cookies.get('install_id');
  if (!id) {
    id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    Cookies.set('install_id', id, {
      expires: 3650,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return id;
}

export function getDeviceInfo() {
  const id = getOrCreateInstallId();
  const w = typeof window !== 'undefined' ? window.screen.width : 0;
  const h = typeof window !== 'undefined' ? window.screen.height : 0;
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  return { id, w, h, dpr };
}