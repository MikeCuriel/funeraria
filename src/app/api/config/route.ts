import { NextRequest, NextResponse } from 'next/server'
import defaultsJson from '../../utils/default.json' assert { type: 'json' }
import { supabase } from '../../../services/dbConnection'

type Row = {
  resolution_w: number
  resolution_h: number
  dpr: number
  config: string
}

function pickNearest(configs: Row[], w: number, h: number, dpr: number) {
  if (!configs?.length) return null
  let best: Row | null = null
  let bestScore = Number.POSITIVE_INFINITY
  for (const c of configs) {
    const dw = Math.abs(c.resolution_w - w)
    const dh = Math.abs(c.resolution_h - h)
    const ddpr = Math.abs(Number(c.dpr) - dpr)
    // pondera resolución más que dpr
    const score = dw * 2 + dh * 2 + ddpr * 100
    if (score < bestScore) { best = c; bestScore = score }
  }
  return best
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const funeraria = (searchParams.get('funeraria') || 'guadalupe').toLowerCase()
  const deviceId = searchParams.get('deviceId') || ''
  const w = Number(searchParams.get('w') || '0')
  const h = Number(searchParams.get('h') || '0')
  const dpr = Number(searchParams.get('dpr') || '1')

  // 1) Intento por device_id exacto
  const { data: exact, error: e1 } = await supabase
    .from('memorial_config')
    .select('config')
    .eq('device_id', deviceId)
    .maybeSingle()

  if (!e1 && exact?.config) {
    return NextResponse.json({ source: 'device', config: exact.config })
  }

  // 2) Fallback: el más cercano por resolución/dpr
  const { data: all, error: e2 } = await supabase
    .from('memorial_config')
    .select('config,resolution_w,resolution_h,dpr')

  if (!e2 && all?.length) {
    const best = pickNearest(all as Row[], w, h, dpr)
    if (best) return NextResponse.json({ source: 'nearest', config: best.config })
  }

  // 3) Último recurso: default.json
  return NextResponse.json({ source: 'fallback', config: defaultsJson })
}

export async function PUT(req: Request) {
  const { funeraria, deviceId, w, h, dpr, config } = await req.json();

  if (!funeraria || !deviceId || !config) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const { error } = await supabase
    .from('memorial_config')
    .upsert(
      {
        funeraria,
        device_id: deviceId,
        resolution_w: Number(w),
        resolution_h: Number(h),
        dpr: Number(dpr ?? 1),
        config,
      },
      { onConflict: 'funeraria,device_id' } // ← coincide con el índice único
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}