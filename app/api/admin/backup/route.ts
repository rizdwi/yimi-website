import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [
      { data: siteSettings },
      { data: programs },
      { data: kajian },
      { data: wakafLahan },
      { data: landUpdates },
      { data: news },
      { data: gallery },
      { data: inbox },
    ] = await Promise.all([
      supabase.from('site_settings').select('*'),
      supabase.from('programs').select('*'),
      supabase.from('jadwal_kajian').select('*'),
      supabase.from('wakaf_lahan').select('*'),
      supabase.from('land_updates').select('*'),
      supabase.from('news_posts').select('*'),
      supabase.from('gallery_items').select('*'),
      supabase.from('kontak_inbox').select('*'),
    ]);

    const backupPayload = {
      meta: {
        exportDate: new Date().toISOString(),
        exportedBy: session.email,
        version: '1.0',
        platform: 'YIMI CMS',
      },
      data: {
        siteSettings: siteSettings || [],
        programs: programs || [],
        jadwalKajian: kajian || [],
        wakafLahan: wakafLahan || [],
        landUpdates: landUpdates || [],
        newsPosts: news || [],
        galleryItems: gallery || [],
        kontakInbox: inbox || [],
      },
    };

    await createAuditLog(session.email, 'Ekspor & Cadangan', 'Mengunduh file cadangan data JSON');

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `yimi-backup-${dateStr}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Gagal membuat cadangan data.' }, { status: 500 });
  }
}
