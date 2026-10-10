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

  // Jika kunci adalah 'kontak', sinkronkan juga ke site_settings
  if (body.kunci === 'kontak' && body.konten) {
    try {
      const { data: currentSettings } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (currentSettings?.id) {
        await supabase
          .from('site_settings')
          .update({
            alamat: body.konten.alamat,
            jam_operasional: body.konten.jamOperasional,
            maps_embed: body.konten.mapsEmbed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSettings.id);
      }
    } catch (syncErr) {
      console.warn('Gagal sinkronisasi site_settings dari static-pages:', syncErr);
    }
  }

  await createAuditLog(
    session.email,
    'Halaman Statis',
    `Memperbarui konten halaman statis: ${body.judul || body.kunci}`,
    data?.id,
    { kunci: body.kunci }
  );

  return NextResponse.json({ success: true, page: data });
}
