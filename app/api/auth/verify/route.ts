import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, message: 'License key is required' }, { status: 400 });
    }

    const cleanKey = key.trim().toUpperCase();

    // Query Supabase for this exact key
    const { data: license, error } = await supabase
      .from('licenses')
      .select('key, client_name, tier, expires_at, is_active, allowed_brokers')
      .eq('key', cleanKey)
      .single();

    if (error || !license) {
      return NextResponse.json({ valid: false, message: 'License key not found in system.' }, { status: 404 });
    }

    if (!license.is_active) {
      return NextResponse.json({ valid: false, message: 'This license has been suspended.' }, { status: 403 });
    }

    // Check expiration (Strict 90-day / lifetime cutoff)
    if (new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Subscription expired. Please renew access.' }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      clientName: license.client_name,
      tier: license.tier,
      expiresAt: license.expires_at,
      allowedBrokers: license.allowed_brokers
    });

  } catch (err: any) {
    return NextResponse.json({ valid: false, message: 'Verification error' }, { status: 500 });
  }
}
