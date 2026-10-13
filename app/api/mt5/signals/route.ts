import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licenseKey = request.headers.get('x-license-key') || searchParams.get('key');

  if (!licenseKey) {
    return NextResponse.json({ error: 'License key required' }, { status: 401 });
  }

  const { data: license, error: licErr } = await supabase
    .from('licenses')
    .select('*')
    .eq('key', licenseKey)
    .eq('is_active', true)
    .single();

  if (licErr || !license) {
    return NextResponse.json({ error: 'Invalid or inactive license key' }, { status: 403 });
  }

  if (new Date(license.expires_at) < new Date()) {
    return NextResponse.json({ error: 'License expired. Please renew.' }, { status: 403 });
  }

  const { data: signals, error: sigErr } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (sigErr) {
    return NextResponse.json({ error: sigErr.message }, { status: 500 });
  }

  return NextResponse.json(signals || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, symbol, action, entry_price, sl, tp, lot_size, bullets, broker } = body;

    if (secret !== 'TMAN_ASSASSIN_MASTER_KEY_2026') {
      return NextResponse.json({ error: 'Unauthorized broadcast' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('signals')
      .insert([{
        symbol,
        action,
        entry_price,
        sl,
        tp,
        lot_size: lot_size || 0.01,
        bullets: bullets || 3,
        broker: broker || 'Universal (RCG/HFM/FxPro/JustMarkets)',
        status: 'PENDING'
      }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, signal: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
