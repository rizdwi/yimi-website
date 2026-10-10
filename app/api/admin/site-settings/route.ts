import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ settings: data || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Validasi WA
    if (body.whatsapp && !/^(\+62|08)[0-9]{8,13}$/.test(body.whatsapp.replace(/[\s-]/g, ''))) {
      return NextResponse.json({ error: 'Format WhatsApp tidak valid. Gunakan awalan +62 atau 08.' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('site_settings').select('*').limit(1).single();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('site_settings')
        .update({
          nama_lengkap: body.nama_lengkap,
          singkatan: body.singkatan,
          tagline: body.tagline,
          whatsapp: body.whatsapp,
          email: body.email,
          alamat: body.alamat,
          maps_embed: body.maps_embed,
          jam_operasional: body.jam_operasional,
          foto_yayasan: body.foto_yayasan || null,
          logo_yayasan: body.logo_yayasan || null,
          bank_1_nama: body.bank_1_nama,
          bank_1_rekening: body.bank_1_rekening,
          bank_1_an: body.bank_1_an,
          bank_2_nama: body.bank_2_nama,
          bank_2_rekening: body.bank_2_rekening,
          bank_2_an: body.bank_2_an,
          qris_image: body.qris_image,
          sosmed: body.sosmed,
          updated_at: new Date().toISOString(),
          updated_by: session.email,
        })
        .eq('id', existing.id);
    } else {
      result = await supabase.from('site_settings').insert({
        ...body,
        foto_yayasan: body.foto_yayasan || null,
        logo_yayasan: body.logo_yayasan || null,
        updated_at: new Date().toISOString(),
        updated_by: session.email,
      });
    }

    if (result.error) {
      return NextResponse.json({ error: 'Gagal memperbarui pengaturan situs.' }, { status: 500 });
    }

    await createAuditLog(
      session.email,
      'Pengaturan Situs',
      'Memperbarui profil yayasan dan rekening',
      existing?.id
    );

    return NextResponse.json({ success: true, message: 'Pengaturan situs berhasil disimpan.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
