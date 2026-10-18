import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';
import { extractGalleryFromPost, embedGalleryIntoPost } from '@/lib/news';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let query = supabase.from('news_posts').select('*').order('created_at', { ascending: false });

  if (status && status !== 'semua') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('judul', `%${search}%`);
  }

  const [{ data, error }, { data: statsLogs }] = await Promise.all([
    query,
    supabase
      .from('visitor_logs')
      .select('path')
      .or('path.ilike./berita/%,path.ilike.like:/berita/%,path.ilike.unlike:/berita/%'),
  ]);

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 });

  const viewsMap: Record<string, number> = {};
  const likesMap: Record<string, number> = {};

  (statsLogs || []).forEach((l) => {
    if (!l.path) return;
    if (l.path.startsWith('like:/berita/')) {
      const s = l.path.replace('like:/berita/', '').split('?')[0].split('/')[0];
      if (s) likesMap[s] = (likesMap[s] || 0) + 1;
    } else if (l.path.startsWith('unlike:/berita/')) {
      const s = l.path.replace('unlike:/berita/', '').split('?')[0].split('/')[0];
      if (s) likesMap[s] = (likesMap[s] || 0) - 1;
    } else if (l.path.startsWith('/berita/')) {
      const s = l.path.replace('/berita/', '').split('?')[0].split('/')[0];
      if (s) viewsMap[s] = (viewsMap[s] || 0) + 1;
    }
  });

  const formatted = (data || []).map((post) => {
    const { cleanIsi, galeri } = extractGalleryFromPost(post.gambar_utama, post.isi);
    return {
      ...post,
      isi: cleanIsi,
      galeri,
      views: viewsMap[post.slug] || 0,
      likes: Math.max(0, likesMap[post.slug] || 0),
    };
  });

  return NextResponse.json({ news: formatted });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.judul) {
    return NextResponse.json({ error: 'Judul berita wajib diisi.' }, { status: 400 });
  }

  const slug = (body.slug || body.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'berita-' + Date.now();

  const { cleanGambarUtama, packagedIsi } = embedGalleryIntoPost(
    body.isi,
    Array.isArray(body.galeri) ? body.galeri : (body.gambar_utama ? [body.gambar_utama] : [])
  );

  const { data, error } = await supabase
    .from('news_posts')
    .insert({
      judul: body.judul,
      slug,
      ringkasan: body.ringkasan || '',
      isi: packagedIsi,
      gambar_utama: cleanGambarUtama,
      kategori: body.kategori || 'Umum',
      penulis: body.penulis || session.nama || 'Tim Dakwah YIMI',
      status: body.status || 'draf',
      terbit_pada: body.terbit_pada || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Berita & Artikel',
    `Membuat berita baru (${body.status}): ${body.judul}`,
    data?.id
  );

  return NextResponse.json({ success: true, news: data });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'ID berita wajib diisi.' }, { status: 400 });

  const { cleanGambarUtama, packagedIsi } = embedGalleryIntoPost(
    body.isi,
    Array.isArray(body.galeri) ? body.galeri : (body.gambar_utama ? [body.gambar_utama] : [])
  );

  const { data, error } = await supabase
    .from('news_posts')
    .update({
      judul: body.judul,
      slug: body.slug,
      ringkasan: body.ringkasan,
      isi: packagedIsi,
      gambar_utama: cleanGambarUtama,
      kategori: body.kategori,
      penulis: body.penulis,
      status: body.status,
      terbit_pada: body.terbit_pada,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Berita & Artikel',
    `Memperbarui berita (${body.status}): ${body.judul}`,
    body.id
  );

  return NextResponse.json({ success: true, news: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const permanent = searchParams.get('permanent') === 'true';

  if (!id) return NextResponse.json({ error: 'ID berita wajib diisi.' }, { status: 400 });

  if (permanent) {
    const { error } = await supabase.from('news_posts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog(session.email, 'Berita & Artikel', `Hapus permanen berita ID: ${id}`, id);
  } else {
    const { error } = await supabase.from('news_posts').update({ status: 'arsip' }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog(session.email, 'Berita & Artikel', `Mengarsipkan berita ID: ${id}`, id);
  }

  return NextResponse.json({ success: true, message: 'Berita berhasil diproses.' });
}
