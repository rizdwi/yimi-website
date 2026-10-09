import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    // Validasi tipe berkas
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format berkas tidak didukung. Harap unggah berkas gambar (JPG, PNG, WebP, SVG).' },
        { status: 400 }
      );
    }

    // Batas ukuran 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran berkas terlalu besar. Maksimal 5 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}-${cleanBase}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('yimi-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Gagal mengunggah gambar: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from('yimi-media').getPublicUrl(fileName);

    await createAuditLog(
      session.email,
      'Media',
      `Mengunggah gambar: ${fileName}`,
      undefined,
      { url: publicData.publicUrl }
    );

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server saat memproses unggahan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
