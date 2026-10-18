import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'Berkas bukti transfer wajib disertakan.' },
        { status: 400 }
      );
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format berkas tidak didukung. Harap unggah foto bukti transfer (JPG, PNG, atau WebP).' },
        { status: 400 }
      );
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran foto terlalu besar. Maksimal 5 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `bukti-donasi/${Date.now()}_${randomSuffix}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('yimi-media')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Gagal upload bukti donasi ke Supabase Storage:', uploadError);
      return NextResponse.json(
        { error: 'Gagal mengunggah foto bukti transfer. Silakan periksa koneksi internet Anda.' },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from('yimi-media')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error upload bukti transfer:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses unggahan.' },
      { status: 500 }
    );
  }
}
