import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const admin = await getAdminSessionFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.storage.from('yimi-media').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      console.error('Storage list error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const files = (data || [])
      .filter((file) => file.name && !file.name.startsWith('.'))
      .map((file) => {
        const publicUrl = `https://fopqfjqztvmktzvahjrh.supabase.co/storage/v1/object/public/yimi-media/${encodeURIComponent(file.name)}`;
        return {
          id: file.id || file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          mimetype: file.metadata?.mimetype || 'image/jpeg',
          created_at: file.created_at || file.updated_at || new Date().toISOString(),
          url: publicUrl,
        };
      });

    return NextResponse.json({ files });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminSessionFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fileName = body?.name;

    if (!fileName) {
      return NextResponse.json({ error: 'Nama berkas diperlukan' }, { status: 400 });
    }

    const { error } = await supabase.storage.from('yimi-media').remove([fileName]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog(
      admin.email || 'admin',
      'Media Library',
      `Menghapus berkas media: ${fileName}`,
      fileName,
      { fileName }
    );

    return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
