import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const kunci = searchParams.get('kunci');

  let query = supabase.from('static_pages').select('*');
  if (kunci) {
    query = query.eq('kunci', kunci);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pages: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.kunci) {
    return NextResponse.json({ error: 'Kunci halaman wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('static_pages')
    .upsert(
      {
        kunci: body.kunci,
        judul: body.judul || 'Halaman Statis',
        konten: body.konten || {},
        status: body.status || 'terbit',
        updated_at: new Date().toISOString(),
        updated_by: session.email,
      },
      { onConflict: 'kunci' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Halaman Statis',
    `Memperbarui konten halaman statis: ${body.judul || body.kunci}`,
    data?.id,
    { kunci: body.kunci }
  );

  return NextResponse.json({ success: true, page: data });
}
