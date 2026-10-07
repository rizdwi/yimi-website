import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (!body.gambar) {
    return NextResponse.json({ error: 'URL atau file gambar wajib diisi.' }, { status: 400 });
  }

  // Aturan F-GAL-03: jika kategori TK/PAUD dan izin orang tua false, jangan aktifkan tampil_publik
  let tampilPublik = body.tampil_publik !== false;
  if (body.kategori === 'TK/PAUD' && !body.izin_orang_tua) {
    tampilPublik = false;
  }

  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      judul: body.judul || 'Dokumentasi Kegiatan YIMI',
      keterangan: body.keterangan || '',
      gambar: body.gambar,
      kategori: body.kategori || 'Kajian',
      urutan: body.urutan || 0,
      izin_orang_tua: Boolean(body.izin_orang_tua),
      tampil_publik: tampilPublik,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Galeri',
    `Menambah foto galeri kategori ${body.kategori} (Izin Anak: ${body.izin_orang_tua ? 'Ya' : 'Tidak'})`,
    data?.id
  );

  return NextResponse.json({ success: true, item: data });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'ID foto wajib diisi.' }, { status: 400 });

  let tampilPublik = body.tampil_publik !== false;
  if (body.kategori === 'TK/PAUD' && !body.izin_orang_tua) {
    tampilPublik = false;
  }

  const { data, error } = await supabase
    .from('gallery_items')
    .update({
      judul: body.judul,
      keterangan: body.keterangan,
      gambar: body.gambar,
      kategori: body.kategori,
      urutan: body.urutan,
      izin_orang_tua: Boolean(body.izin_orang_tua),
      tampil_publik: tampilPublik,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Galeri',
    `Memperbarui foto galeri ID: ${body.id}`,
    body.id
  );

  return NextResponse.json({ success: true, item: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID foto wajib diisi.' }, { status: 400 });

  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Galeri', `Menghapus foto galeri ID: ${id}`, id);
  return NextResponse.json({ success: true, message: 'Foto berhasil dihapus.' });
}
