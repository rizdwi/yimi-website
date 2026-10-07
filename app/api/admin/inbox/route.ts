import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('kontak_inbox')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  return NextResponse.json({ messages: data || [] });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'ID pesan wajib diisi.' }, { status: 400 });

  const { data, error } = await supabase
    .from('kontak_inbox')
    .update({
      dibaca: body.dibaca,
      status: body.status || 'dibaca',
      catatan_internal: body.catatan_internal,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Pesan Masuk',
    `Memperbarui status pesan dari ${data?.nama} (Dibaca: ${body.dibaca ? 'Ya' : 'Belum'})`,
    body.id
  );

  return NextResponse.json({ success: true, message: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID pesan wajib diisi.' }, { status: 400 });

  const { error } = await supabase.from('kontak_inbox').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Pesan Masuk', `Menghapus pesan kontak ID: ${id}`, id);
  return NextResponse.json({ success: true, message: 'Pesan berhasil dihapus.' });
}
