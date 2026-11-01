import { NextRequest, NextResponse } from 'next/server';
import sitemap from '@/app/sitemap';

const INDEXNOW_KEY = 'b7a9f24c3d8146e5912854ef0291ba3d';
const HOST = 'yimi.my.id';

/**
 * Endpoint pemicu submit batch URL ke IndexNow (Bing, Yandex, Naver).
 * Dapat dipicu via Vercel Cron, admin dashboard, atau web hook saat artikel baru terbit.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // izinkan juga jika dipanggil secara manual dari admin
    const searchKey = req.nextUrl.searchParams.get('key');
    if (searchKey !== INDEXNOW_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const urls = await sitemap();
    const urlList = urls.map((u) => u.url);

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const status = res.status;
    const ok = status >= 200 && status <= 204;

    return NextResponse.json({
      success: ok,
      status,
      submittedUrlsCount: urlList.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error submitting to IndexNow:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit IndexNow' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
