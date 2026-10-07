import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('urutan', { ascending: true });

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  return NextResponse.json({ programs: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.judul || !body.slug) {
    return NextResponse.json({ error: 'Judul dan slug program wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({
      judul: body.judul,
      slug: body.slug,
      ringkasan: body.ringkasan || '',
      deskripsi: body.deskripsi || '',
      ikon: body.ikon || 'BookOpen',
      gambar: body.gambar || '',
      urutan: body.urutan || 0,
      tampil_beranda: body.tampil_beranda !== false,
      is_archived: false,
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Program', `Menambah program baru: ${body.judul}`, data?.id);
  return NextResponse.json({ success: true, program: data });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'ID program wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('programs')
    .update({
      judul: body.judul,
      slug: body.slug,
      ringkasan: body.ringkasan,
      deskripsi: body.deskripsi,
      ikon: body.ikon,
      gambar: body.gambar,
      urutan: body.urutan,
      tampil_beranda: body.tampil_beranda,
      is_archived: body.is_archived,
      metadata: body.metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Program', `Memperbarui program: ${body.judul}`, body.id);
  return NextResponse.json({ success: true, program: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const permanent = searchParams.get('permanent') === 'true';

  if (!id) return NextResponse.json({ error: 'ID program wajib diisi.' }, { status: 400 });

  if (permanent) {
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog(session.email, 'Program', `Hapus permanen program ID: ${id}`, id);
  } else {
    // Soft delete: arsip
    const { error } = await supabase.from('programs').update({ is_archived: true }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog(session.email, 'Program', `Mengarsipkan program ID: ${id}`, id);
  }

  return NextResponse.json({ success: true, message: 'Program berhasil diproses.' });
}
