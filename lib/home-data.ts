// Data beranda (server-side) — dipakai Server Component halaman beranda.
//
// Mengambil data dari API route publik (logika Supabase + fallback sudah ada
// di sana) agar tidak menduplikasi logika tersebut. Data di-pass sebagai props
// ke section, sehingga konten ter-render di HTML awal — bukan fetch
// client-side setelah load (itu yang membuat LCP 4,1 dtk & CLS 0,19).
//
// Halaman beranda memakai ISR (revalidate 60 dtk), jadi fetch ini hanya
// berjalan sekali per 60 dtk (saat revalidasi), bukan di setiap request.
// Bila fetch gagal, kembalikan null — section memakai fallback lokal /
// fetch client-side seperti semula (tidak merusak halaman).

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type HomeHeroContent = {
  tagline: string;
  subtitle: string;
};

export type HomeDalil = {
  arab: string;
  terjemahan: string;
  sumber: string;
};

export type HomeData = {
  hero: HomeHeroContent;
  dalil: HomeDalil | null;
  programs: unknown[];
  campaign: Record<string, unknown> | null;
  kajian: unknown[];
  news: unknown[];
  gallery: unknown[];
};

function extractHero(
  data: { page?: { konten?: Record<string, unknown> } } | null
): HomeHeroContent {
  const k = data?.page?.konten ?? {};
  const list: string[] = Array.isArray(k.heroTaglines)
    ? (k.heroTaglines as unknown[]).filter(
        (t): t is string => typeof t === 'string' && t.trim().length > 0
      )
    : typeof k.heroTagline === 'string' && k.heroTagline.trim()
      ? [k.heroTagline as string]
      : [];
  return {
    tagline: list[0] ?? '',
    subtitle:
      typeof k.heroSubtitle === 'string' ? (k.heroSubtitle as string) : '',
  };
}

function extractDalil(
  data: { page?: { konten?: Record<string, unknown> } } | null
): HomeDalil | null {
  const konten = data?.page?.konten as
    | { manhaj?: { dalilQuran?: Record<string, unknown> } }
    | undefined;
  const q = konten?.manhaj?.dalilQuran;
  if (!q) return null;
  const arab = typeof q.arab === 'string' ? q.arab : '';
  const terjemahan =
    typeof q.terjemahan === 'string' ? q.terjemahan : '';
  const sumber = typeof q.sumber === 'string' ? q.sumber : '';
  if (!arab && !terjemahan) return null;
  return { arab, terjemahan, sumber };
}

export async function getHomeData(): Promise<HomeData> {
  const [beranda, tentang, programsRes, lahanRes, kajianRes, beritaRes, galeriRes] =
    await Promise.all([
      fetchJson<{ page?: { konten?: Record<string, unknown> } }>(
        '/api/halaman?kunci=beranda'
      ),
      fetchJson<{ page?: { konten?: Record<string, unknown> } }>(
        '/api/halaman?kunci=tentang'
      ),
      fetchJson<{ programs?: unknown[] }>('/api/programs'),
      fetchJson<{ campaign?: Record<string, unknown> }>('/api/lahan'),
      fetchJson<{ kajian?: unknown[] }>('/api/kajian'),
      fetchJson<{ news?: unknown[] }>('/api/berita'),
      fetchJson<{ items?: unknown[] }>('/api/galeri?beranda=true'),
    ]);

  return {
    hero: extractHero(beranda),
    dalil: extractDalil(tentang),
    programs: Array.isArray(programsRes?.programs)
      ? (programsRes.programs as unknown[]).filter(
          (p) =>
            (p as { tampil_beranda?: boolean }).tampil_beranda !== false
        )
      : [],
    campaign: lahanRes?.campaign ?? null,
    kajian: Array.isArray(kajianRes?.kajian) ? kajianRes.kajian : [],
    news: Array.isArray(beritaRes?.news) ? beritaRes.news : [],
    gallery: Array.isArray(galeriRes?.items) ? galeriRes.items : [],
  };
}
