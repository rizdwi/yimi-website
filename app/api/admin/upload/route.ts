import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    let files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      files = formData.getAll('file') as File[];
    }

    if (!files || files.length === 0 || !files[0]?.name) {
      return NextResponse.json({ error: 'Tidak ada berkas yang diunggah.' }, { status: 400 });
    }

    // Validasi tipe berkas: gambar dan dokumen
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const validDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    const results: Array<{
      url: string;
      fileName: string;
      size: number;
      originalName: string;
      isImage: boolean;
    }> = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const isImage = validImageTypes.includes(file.type);
      const isDoc = validDocTypes.includes(file.type);

      if (!isImage && !isDoc) {
        return NextResponse.json(
          {
            error: `Format berkas ${file.name} tidak didukung. Harap unggah berkas gambar (JPG, PNG, WebP, SVG) atau dokumen (PDF, Word, Excel).`,
          },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Ukuran berkas ${file.name} terlalu besar. Maksimal 10 MB per berkas.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'pdf');
      const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const fileName = `${Date.now()}_${randomSuffix}-${cleanBase}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('yimi-media')
        .upload(fileName, buffer, {
          contentType: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        return NextResponse.json(
          { error: `Gagal mengunggah berkas ${file.name}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from('yimi-media')
        .getPublicUrl(fileName);

      results.push({
        url: publicData.publicUrl,
        fileName,
        size: file.size,
        originalName: file.name,
        isImage,
      });
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Gagal memproses berkas yang diunggah.' }, { status: 400 });
    }

    await createAuditLog(
      session.email,
      'Media',
      `Mengunggah ${results.length} berkas: ${results.map((r) => r.fileName).slice(0, 3).join(', ')}${results.length > 3 ? '...' : ''}`,
      undefined,
      { count: results.length, urls: results.map((r) => r.url) }
    );

    const first = results[0];
    return NextResponse.json({
      success: true,
      url: first.url,
      fileName: first.fileName,
      originalName: first.originalName,
      size: first.size,
      isImage: first.isImage,
      urls: results.map((r) => r.url),
      results,
      count: results.length,
    });
  } catch (err: unknown) {
    console.error('API Upload error:', err);
    const message =
      err instanceof Error ? err.message : 'Terjadi kesalahan server saat memproses unggahan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
