import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const modul = searchParams.get('modul');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(limit);

  if (modul && modul !== 'semua') {
    query = query.eq('modul', modul);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });

  return NextResponse.json({ logs: data || [] });
}
