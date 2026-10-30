import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type RankingResult = {
  keyword: string;
  position: number | null; // null = tidak masuk 20 besar
};

// POST /api/cron/rankings — dipanggil cron harian dari VM.
// Header wajib: x-cron-secret == process.env.RANKING_CRON_SECRET
// Body: { date: "YYYY-MM-DD", results: [{ keyword, position }] }
export async function POST(req: NextRequest) {
  const secret = process.env.RANKING_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'cron secret belum dikonfigurasi' }, { status: 500 });
  }
  const got = req.headers.get('x-cron-secret');
  if (got !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { date?: string; results?: RankingResult[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'body JSON tidak valid' }, { status: 400 });
  }

  const date = body.date;
  const results = body.results;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(results) || results.length === 0) {
    return NextResponse.json({ error: 'butuh date (YYYY-MM-DD) + results[]' }, { status: 400 });
  }

  const rows = results
    .filter((r) => typeof r.keyword === 'string' && r.keyword.length > 0)
    .map((r) => ({
      keyword: r.keyword.trim(),
      check_date: date,
      position: typeof r.position === 'number' && r.position > 0 ? r.position : null,
    }));
  if (rows.length === 0) {
    return NextResponse.json({ error: 'tidak ada baris valid' }, { status: 400 });
  }

  const { error } = await supabase
    .from('seo_rankings')
    .upsert(rows, { onConflict: 'keyword,check_date' });

  if (error) {
    console.error('Gagal simpan seo_rankings:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved: rows.length, date });
}
