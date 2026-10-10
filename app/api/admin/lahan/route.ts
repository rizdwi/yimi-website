import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

// Ambil Data Kampanye Lahan & Riwayat Update
export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: campaign, error: campError } = await supabase
    .from('wakaf_lahan')
    .select('*')
    .limit(1)
    .single();

  if (campError) {
    return NextResponse.json({ error: campError.message }, { status: 500 });
  }

  const { data: updates, error: updError } = await supabase
    .from('land_updates')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (updError) {
    return NextResponse.json({ error: updError.message }, { status: 500 });
  }

  return NextResponse.json({ campaign, updates });
}

// Tambah Update Dana Masuk Lahan Baru
export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const nominal = Number(body.nominal);

  if (isNaN(nominal) || nominal <= 0) {
    return NextResponse.json({ error: 'Nominal donasi harus lebih dari 0.' }, { status: 400 });
  }

  const { data: updateEntry, error: insertError } = await supabase
    .from('land_updates')
    .insert([
      {
        tanggal: body.tanggal || new Date().toISOString().split('T')[0],
        nominal,
        catatan: body.catatan,
        gambar_url: body.gambar_url || null,
        created_by: session.nama || session.email,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

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

// Update Target, Dana Terkumpul, & Metadata Kampanye
export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data: currentCampaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();

  if (!currentCampaign) {
    return NextResponse.json({ error: 'Kampanye tidak ditemukan.' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {
    diperbarui_pada: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  if (body.judul !== undefined) updateData.judul = body.judul;
  if (body.lokasi !== undefined) updateData.lokasi = body.lokasi;
  if (body.luas_target_m2 !== undefined) updateData.luas_target_m2 = Number(body.luas_target_m2);
  if (body.harga_per_meter !== undefined) updateData.harga_per_meter = Number(body.harga_per_meter);
  if (body.target_dana !== undefined) updateData.target_dana = Number(body.target_dana);
  if (body.terkumpul !== undefined) updateData.terkumpul = Number(body.terkumpul);

  const { data, error } = await supabase
    .from('wakaf_lahan')
    .update(updateData)
    .eq('id', currentCampaign.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await createAuditLog(
    session.email,
    'Pembebasan Lahan',
    `Mengubah parameter target & data kampanye lahan (Target: Rp ${Number(data.target_dana).toLocaleString('id-ID')}, Terkumpul: Rp ${Number(data.terkumpul).toLocaleString('id-ID')})`,
    currentCampaign.id
  );

  return NextResponse.json({ success: true, campaign: data });
}

// Edit Riwayat Update Dana Masuk Lahan Tertentu
export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: 'ID update wajib diisi.' }, { status: 400 });
  }

  const { data: oldUpdate, error: findError } = await supabase
    .from('land_updates')
    .select('*')
    .eq('id', body.id)
    .single();

  if (findError || !oldUpdate) {
    return NextResponse.json({ error: 'Data update tidak ditemukan.' }, { status: 404 });
  }

  const nominalBaru = Number(body.nominal);
  const selisihNominal = nominalBaru - Number(oldUpdate.nominal);

  const { data: updatedEntry, error: updateError } = await supabase
    .from('land_updates')
    .update({
      tanggal: body.tanggal || oldUpdate.tanggal,
      nominal: nominalBaru,
      catatan: body.catatan || oldUpdate.catatan,
      gambar_url: body.gambar_url !== undefined ? body.gambar_url : oldUpdate.gambar_url,
    })
    .eq('id', body.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Sesuaikan akumulasi total dana terkumpul di wakaf_lahan
  if (selisihNominal !== 0) {
    const { data: currentCampaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();
    if (currentCampaign) {
      const newTerkumpul = Math.max(0, Number(currentCampaign.terkumpul) + selisihNominal);
      await supabase
        .from('wakaf_lahan')
        .update({
          terkumpul: newTerkumpul,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCampaign.id);
    }
  }

  await createAuditLog(
    session.email,
    'Pembebasan Lahan',
    `Mengedit catatan donasi lahan ID: ${body.id} menjadi Rp ${nominalBaru.toLocaleString('id-ID')}`,
    body.id
  );

  return NextResponse.json({ success: true, update: updatedEntry });
}

// Hapus Riwayat Update Dana Masuk Lahan
export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID update wajib diisi.' }, { status: 400 });
  }

  const { data: oldUpdate, error: findError } = await supabase
    .from('land_updates')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !oldUpdate) {
    return NextResponse.json({ error: 'Data update tidak ditemukan.' }, { status: 404 });
  }

  const { error: delError } = await supabase.from('land_updates').delete().eq('id', id);
  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }

  // Kurangi total terkumpul sesuai nominal yang dihapus
  const { data: currentCampaign } = await supabase.from('wakaf_lahan').select('*').limit(1).single();
  if (currentCampaign) {
    const newTerkumpul = Math.max(0, Number(currentCampaign.terkumpul) - Number(oldUpdate.nominal));
    await supabase
      .from('wakaf_lahan')
      .update({
        terkumpul: newTerkumpul,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentCampaign.id);
  }

  await createAuditLog(
    session.email,
    'Pembebasan Lahan',
    `Menghapus riwayat donasi lahan ID: ${id} sebesar Rp ${Number(oldUpdate.nominal).toLocaleString('id-ID')}`,
    id
  );

  return NextResponse.json({ success: true, message: 'Riwayat update berhasil dihapus.' });
}
