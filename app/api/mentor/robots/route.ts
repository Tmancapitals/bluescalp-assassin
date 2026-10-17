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
      .from('robots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ robots: data || [] });
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
      const { name, version, description, image_url, allowed_pairs, strategy_type } = body;
      if (!name) {
        return NextResponse.json({ error: 'Robot name is required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('robots')
        .insert([
          {
            name: name.trim(),
            version: version || 'v1.0',
            description: description || 'High-probability execution engine',
            image_url: image_url || '/images/bluescalp-bot.jpg',
            allowed_pairs: Array.isArray(allowed_pairs) ? allowed_pairs : (allowed_pairs || 'XAUUSD,EURUSD,GBPUSD').split(',').map((s: string) => s.trim()),
            strategy_type: strategy_type || 'Machine Gunner Scalp',
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, robot: data });
    }

    if (action === 'toggle_status') {
      const { id, is_active } = body;
      const { data, error } = await supabase
        .from('robots')
        .update({ is_active: !!is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, robot: data });
    }

    if (action === 'delete') {
      const { id } = body;
      const { error } = await supabase
        .from('robots')
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
