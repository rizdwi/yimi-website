import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

interface GalleryBatchItemInput {
  judul?: string;
  keterangan?: string;
  gambar: string;
  kategori?: string;
  urutan?: number;
  izin_orang_tua?: boolean;
  tampil_publik?: boolean;
  tampil_beranda?: boolean;
}

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

  // Support batch upload / multiple photos insertion
  if (Array.isArray(body.items) && body.items.length > 0) {
    const validItems = (body.items as GalleryBatchItemInput[]).filter((i) => i && i.gambar);
    if (validItems.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data foto yang valid.' }, { status: 400 });
    }

    const rows = validItems.map((item) => {
      let tampilPublik = item.tampil_publik !== false;
      if (item.kategori === 'TK/PAUD' && !item.izin_orang_tua) {
        tampilPublik = false;
      }
      return {
        judul: item.judul || 'Dokumentasi Kegiatan YIMI',
        keterangan: item.keterangan || '',
        gambar: item.gambar,
        kategori: item.kategori || 'Kajian',
        urutan: typeof item.urutan === 'number' ? item.urutan : 0,
        izin_orang_tua: item.izin_orang_tua !== false,
        tampil_publik: tampilPublik,
        tampil_beranda: item.tampil_beranda !== false,
        created_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase
      .from('gallery_items')
      .insert(rows)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await createAuditLog(
      session.email,
      'Galeri',
      `Menambahkan ${rows.length} foto galeri secara batch/sekaligus`
    );

    return NextResponse.json({ success: true, count: rows.length, items: data });
  }

  // Single item insert
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
      tampil_beranda: body.tampil_beranda !== false,
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
      tampil_beranda: body.tampil_beranda !== false,
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
  const deleteAsset = searchParams.get('delete_asset') !== 'false';

  if (!id) return NextResponse.json({ error: 'ID foto wajib diisi.' }, { status: 400 });

  // Ambil data foto terlebih dahulu untuk mengetahui URL asetnya
  const { data: itemToDelete } = await supabase
    .from('gallery_items')
    .select('gambar, judul')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Jika diminta hapus media aset dari storage juga
  if (deleteAsset && itemToDelete?.gambar && itemToDelete.gambar.includes('yimi-media')) {
    try {
      const parts = itemToDelete.gambar.split('yimi-media/');
      if (parts.length > 1) {
        const rawFileName = parts[1].split('?')[0];
        const fileName = decodeURIComponent(rawFileName);
        if (fileName) {
          await supabase.storage.from('yimi-media').remove([fileName]);
        }
      }
    } catch (storageErr) {
      console.warn('Gagal menghapus aset media storage:', storageErr);
    }
  }

  await createAuditLog(
    session.email,
    'Galeri',
    `Menghapus foto galeri "${itemToDelete?.judul || id}" dan aset media terkait`,
    id
  );
  return NextResponse.json({ success: true, message: 'Foto dan media aset berhasil dihapus.' });
}
