import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabase
      .from('kontak_inbox')
      .select('*')
      .like('kategori', 'Konfirmasi Donasi%')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map((row) => {
      let parsedPayload: Record<string, any> = {};
      try {
        if (row.pesan && row.pesan.startsWith('{')) {
          parsedPayload = JSON.parse(row.pesan);
        }
      } catch {
        // fallback
      }

      const isAnon = !!parsedPayload.is_anonim;
      const statusRaw = row.status || 'menunggu';
      const statusNormalized = (statusRaw === 'baru' ? 'menunggu' : statusRaw);

      return {
        id: row.id,
        ref_id: parsedPayload.ref_id || `YIMI-${row.id.substring(0, 8).toUpperCase()}`,
        nama: parsedPayload.nama_tampil || (isAnon ? 'Hamba Allah' : row.nama.replace(/\s*\(Anonim.*?\)/i, '')),
        nama_asli: parsedPayload.nama_asli || row.nama.replace(/\s*\(Anonim.*?\)/i, ''),
        is_anonim: isAnon,
        email: parsedPayload.email || '',
        whatsapp: parsedPayload.whatsapp || row.kontak,
        program: parsedPayload.program || row.kategori.replace('Konfirmasi Donasi: ', ''),
        nominal: Number(parsedPayload.nominal) || 0,
        bank_tujuan: parsedPayload.bank_tujuan || 'BSI',
        tanggal_transfer: parsedPayload.tanggal_transfer || (row.created_at ? row.created_at.split('T')[0] : ''),
        bukti_transfer_url: parsedPayload.bukti_transfer_url || null,
        doa: parsedPayload.doa || '',
        status: statusNormalized,
        dibaca: !!row.dibaca,
        catatan_internal: row.catatan_internal || '',
        created_at: row.created_at,
      };
    });

    const summary = {
      total_count: items.length,
      total_nominal: items.reduce((acc, curr) => acc + curr.nominal, 0),
      menunggu_count: items.filter((i) => i.status === 'menunggu').length,
      menunggu_nominal: items
        .filter((i) => i.status === 'menunggu')
        .reduce((acc, curr) => acc + curr.nominal, 0),
      terverifikasi_count: items.filter((i) => i.status === 'terverifikasi').length,
      terverifikasi_nominal: items
        .filter((i) => i.status === 'terverifikasi')
        .reduce((acc, curr) => acc + curr.nominal, 0),
    };

    return NextResponse.json({
      donasi: items,
      donations: items,
      summary,
      stats: summary,
    });
  } catch (error) {
    console.error('Admin GET donasi error:', error);
    return NextResponse.json({ error: 'Gagal memuat data donasi.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, catatan_internal, sync_to_lahan, nominal, program, nama_donatur, ref_id } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID dan status verifikasi wajib diisi.' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('kontak_inbox')
      .update({
        status,
        dibaca: true,
        catatan_internal: catatan_internal || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Jika diverifikasi dan dicentang untuk update ke progres lahan
    if (status === 'terverifikasi' && sync_to_lahan && Number(nominal) > 0) {
      try {
        const tgl = new Date().toISOString().split('T')[0];
        const catatanLahan = `Wakaf donatur ${nama_donatur || 'Muhsinin'} (Ref: ${ref_id || id.substring(0, 8)})`;

        // 1. Tambah riwayat update lahan
        await supabase.from('land_updates').insert([
          {
            tanggal: tgl,
            nominal: Number(nominal),
            catatan: catatanLahan,
          },
        ]);

        // 2. Tambah akumulasi terkumpul di wakaf_lahan
        const { data: currentLahan } = await supabase
          .from('wakaf_lahan')
          .select('id, terkumpul')
          .limit(1)
          .single();

        if (currentLahan) {
          const newTerkumpul = Number(currentLahan.terkumpul || 0) + Number(nominal);
          await supabase
            .from('wakaf_lahan')
            .update({
              terkumpul: newTerkumpul,
              diperbarui_pada: tgl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentLahan.id);
        }
      } catch (syncErr) {
        console.warn('Gagal sinkronisasi ke progres lahan:', syncErr);
      }
    }

    await createAuditLog(
      session.email,
      'Konfirmasi Donasi',
      `Mengubah status donasi ${nama_donatur || id} menjadi ${status.toUpperCase()}${sync_to_lahan ? ' (+ Sync Progres Lahan)' : ''}`,
      id,
      { status, nominal, sync_to_lahan }
    );

    return NextResponse.json({ success: true, message: 'Status donasi berhasil diperbarui.' });
  } catch (error) {
    console.error('Admin PUT donasi error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memperbarui status.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID konfirmasi donasi wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase.from('kontak_inbox').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog(session.email, 'Konfirmasi Donasi', `Menghapus entri konfirmasi donasi ID: ${id}`, id);

    return NextResponse.json({ success: true, message: 'Entri konfirmasi donasi berhasil dihapus.' });
  } catch (error) {
    console.error('Admin DELETE donasi error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat menghapus entri.' }, { status: 500 });
  }
}
