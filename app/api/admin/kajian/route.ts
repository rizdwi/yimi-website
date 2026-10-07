import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('jadwal_kajian')
    .select('*')
    .order('tanggal', { ascending: false });

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });
  return NextResponse.json({ kajian: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (!body.tema || !body.pemateri || !body.tanggal || !body.waktu) {
    return NextResponse.json({ error: 'Tema, pemateri, tanggal, dan waktu wajib diisi.' }, { status: 400 });
  }

  // Validasi jam selesai > jam mulai jika keduanya ada
  if (body.jam_mulai && body.jam_selesai && body.jam_selesai <= body.jam_mulai) {
    return NextResponse.json({ error: 'Jam selesai harus setelah jam mulai.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('jadwal_kajian')
    .insert({
      tema: body.tema,
      pemateri: body.pemateri,
      tanggal: body.tanggal,
      hari: body.hari || 'Ahad',
      waktu: body.waktu,
      jam_mulai: body.jam_mulai || null,
      jam_selesai: body.jam_selesai || null,
      tempat: body.tempat || 'Masjid Binaan YIMI, Lt. Utama',
      kategori: body.kategori || 'Rutin Pekanan',
      sifat: body.sifat || 'Terbuka untuk Umum (Ikhwan & Akhwat)',
      status: body.status || 'aktif',
      is_active: body.status !== 'batal',
      alasan_batal: body.alasan_batal || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Jadwal Kajian', `Menambah jadwal kajian: ${body.tema}`, data?.id);
  return NextResponse.json({ success: true, kajian: data });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'ID kajian wajib diisi.' }, { status: 400 });

  if (body.jam_mulai && body.jam_selesai && body.jam_selesai <= body.jam_mulai) {
    return NextResponse.json({ error: 'Jam selesai harus setelah jam mulai.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('jadwal_kajian')
    .update({
      tema: body.tema,
      pemateri: body.pemateri,
      tanggal: body.tanggal,
      hari: body.hari,
      waktu: body.waktu,
      jam_mulai: body.jam_mulai,
      jam_selesai: body.jam_selesai,
      tempat: body.tempat,
      kategori: body.kategori,
      sifat: body.sifat,
      status: body.status,
      is_active: body.status !== 'batal',
      alasan_batal: body.alasan_batal,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Jadwal Kajian', `Memperbarui jadwal kajian: ${body.tema}`, body.id);
  return NextResponse.json({ success: true, kajian: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID kajian wajib diisi.' }, { status: 400 });

  const { error } = await supabase.from('jadwal_kajian').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(session.email, 'Jadwal Kajian', `Menghapus jadwal kajian ID: ${id}`, id);
  return NextResponse.json({ success: true, message: 'Kajian berhasil dihapus.' });
}
