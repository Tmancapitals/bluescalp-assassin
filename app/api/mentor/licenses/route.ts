import { NextRequest, NextResponse } from 'next/server';
import { isMentorAuthorized } from '@/lib/mentor-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  if (!isMentorAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ licenses: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isMentorAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { client_name, email, whatsapp, tier, key, duration_days } = body;
      if (!client_name || !key) {
        return NextResponse.json({ error: 'Client name and license key are required' }, { status: 400 });
      }

      let expires_at: string | null = null;
      const days = Number(duration_days) || (tier === '3_months' ? 90 : 3650);
      if (tier === '3_months') {
        expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('licenses')
        .insert([
          {
            key: key.trim().toUpperCase(),
            client_name: client_name.trim(),
            email: email ? email.trim() : null,
            whatsapp: whatsapp ? whatsapp.trim() : null,
            tier: tier || '3_months',
            duration_days: days,
            expires_at,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, license: data });
    }

    if (action === 'toggle_status') {
      const { id, is_active } = body;
      const { data, error } = await supabase
        .from('licenses')
        .update({ is_active: !!is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, license: data });
    }

    if (action === 'delete') {
      const { id } = body;
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process request' }, { status: 500 });
  }
}
