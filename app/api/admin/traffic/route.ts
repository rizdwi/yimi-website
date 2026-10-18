import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Ambil log kunjungan terbaru
    const { data: logs, error } = await supabase
      .from('visitor_logs')
      .select('id, path, referrer, device_type, ip_hash, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching visitor logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allLogs = logs || [];
    const totalViews = allLogs.length;

    // Hitung pengunjung unik total
    const uniqueIps = new Set(allLogs.map((l) => l.ip_hash).filter(Boolean));
    const uniqueVisitors = uniqueIps.size;

    // Filter hari ini
    const todayLogs = allLogs.filter((l) => l.created_at >= todayStart);
    const todayViews = todayLogs.length;
    const todayUniques = new Set(todayLogs.map((l) => l.ip_hash).filter(Boolean)).size;

    // Filter 7 hari terakhir
    const weekLogs = allLogs.filter((l) => l.created_at >= weekAgo);
    const weekViews = weekLogs.length;

    // Halaman paling populer
    const pageCounts: Record<string, number> = {};
    allLogs.forEach((l) => {
      const p = l.path || '/';
      if (p.startsWith('like:') || p.startsWith('unlike:')) return;
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Sumber rujukan (Referrer)
    const refCounts: Record<string, number> = {};
    allLogs.forEach((l) => {
      const r = l.referrer || 'Langsung (Direct)';
      refCounts[r] = (refCounts[r] || 0) + 1;
    });

    const topReferrers = Object.entries(refCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Perangkat
    let mobileCount = 0;
    let desktopCount = 0;
    allLogs.forEach((l) => {
      if (l.device_type === 'mobile') mobileCount++;
      else desktopCount++;
    });

    // Kunjungan terbaru
    const recentVisits = allLogs.slice(0, 8).map((l) => ({
      id: l.id,
      path: l.path,
      referrer: l.referrer,
      device_type: l.device_type,
      created_at: l.created_at,
    }));

    return NextResponse.json({
      traffic: {
        totalViews,
        uniqueVisitors,
        todayViews,
        todayUniques,
        weekViews,
        topPages,
        topReferrers,
        devices: {
          mobile: mobileCount,
          desktop: desktopCount,
        },
        recentVisits,
      },
    });
  } catch (err) {
    console.error('Error generating traffic stats:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
