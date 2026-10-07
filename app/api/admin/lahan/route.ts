import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: campaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();
  const { data: updates } = await supabase
    .from('land_updates')
    .select('*')
    .order('tanggal', { ascending: false });

  return NextResponse.json({
    campaign: campaign || null,
    updates: updates || [],
  });
}

// Tambah Update Progres Dana Lahan (Append-Only)
export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const nominal = Number(body.nominal);

  if (isNaN(nominal) || nominal <= 0) {
    return NextResponse.json({ error: 'Nominal dana masuk harus lebih besar dari 0.' }, { status: 400 });
  }

  if (!body.catatan) {
    return NextResponse.json({ error: 'Catatan update wajib diisi.' }, { status: 400 });
  }

  // 1. Simpan ke riwayat append-only
  const { data: updateEntry, error: insertError } = await supabase
    .from('land_updates')
    .insert({
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      nominal: nominal,
      catatan: body.catatan,
      gambar_url: body.gambar_url || null,
      created_by: session.email,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 2. Ambil data lahan saat ini dan update total terkumpul
  const { data: currentCampaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();
  if (currentCampaign) {
    const newTerkumpul = Number(currentCampaign.terkumpul) + nominal;
    await supabase
      .from('wakaf_lahan')
      .update({
        terkumpul: newTerkumpul,
        diperbarui_pada: body.tanggal || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentCampaign.id);
  }

  await createAuditLog(
    session.email,
    'Pembebasan Lahan',
    `Menambah update dana masuk sebesar Rp ${nominal.toLocaleString('id-ID')}: ${body.catatan}`,
    updateEntry?.id
  );

  return NextResponse.json({ success: true, update: updateEntry });
}

// Update Target & Metadata Kampanye
export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data: currentCampaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();

  if (!currentCampaign) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('wakaf_lahan')
    .update({
      judul: body.judul,
      lokasi: body.lokasi,
      luas_target_m2: body.luas_target_m2,
      harga_per_meter: body.harga_per_meter,
      target_dana: body.target_dana,
      diperbarui_pada: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentCampaign.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Pembebasan Lahan',
    `Mengubah parameter target kampanye lahan`,
    currentCampaign.id
  );

  return NextResponse.json({ success: true, campaign: data });
}
