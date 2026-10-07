import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Hitung berita draf
    const { count: draftNewsCount } = await supabase
      .from('news_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draf');

    // 2. Hitung kajian aktif
    const { data: upcomingKajian } = await supabase
      .from('jadwal_kajian')
      .select('*')
      .eq('status', 'aktif')
      .order('tanggal', { ascending: true })
      .limit(5);

    // 3. Hitung pesan kontak belum dibaca
    const { count: unreadMessagesCount } = await supabase
      .from('kontak_inbox')
      .select('*', { count: 'exact', head: true })
      .eq('dibaca', false);

    // 4. Progres Lahan
    const { data: landData } = await supabase
      .from('wakaf_lahan')
      .select('*')
      .limit(1)
      .single();

    // 5. 10 Aktivitas Terakhir
    const { data: recentActivities } = await supabase
      .from('audit_logs')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        draftNews: draftNewsCount || 0,
        upcomingKajianCount: upcomingKajian?.length || 0,
        unreadMessages: unreadMessagesCount || 0,
        landTarget: landData?.target_dana || 1800000000,
        landCollected: landData?.terkumpul || 774000000,
        lastPublished: landData?.diperbarui_pada || new Date().toISOString().split('T')[0],
      },
      upcomingKajian: upcomingKajian || [],
      recentActivities: recentActivities || [],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
