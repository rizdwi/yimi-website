// Data beranda (server-side) — dipakai Server Component halaman beranda.
//
// LANGSUNG query Supabase (tanpa HTTP self-fetch ke API route sendiri).
// Alasan: getHomeData lama mem-fetch 7 API route via HTTP
// (https://yimi.my.id/api/...) — tiap route query Supabase + format JSON.
// Itu membuat render server lambat & rapuh (cold ISR = TTFB detik, LCP
// 3,5 → 5 dtk). Query langsung memangkas round-trip HTTP + payload
// berlebih (mis. /api/berita mengembalikan isi artikel LENGKAP padahal
// kartu beranda hanya butuh ringkasan). Logika + fallback dipakai ulang
// dari API route (bukan diduplikasi dari nol).
//
// Halaman beranda memakai ISR (revalidate 3600 dtk), jadi query ini hanya
// berjalan sekali per 60 dtk (saat revalidasi), bukan di setiap request.
// Bila query gagal, kembalikan fallback lokal / array kosong — section
// memakai fallback seperti semula (tidak merusak halaman).

import { supabase } from '@/lib/supabase';
import aboutFallback from '@/content/about.json';
import fallbackPrograms from '@/content/programs/index.json';
import fallbackNews from '@/content/news/index.json';
import landFallback from '@/content/land-campaign.json';
import kajianFallback from '@/content/kajian.json';
import galleryFallback from '@/content/gallery.json';
import { saringKajianAktif } from '@/lib/kajian';
import { formatRupiah } from '@/lib/format';
import { extractGalleryFromPost } from '@/lib/news';

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
  konten: Record<string, unknown> | null
): HomeHeroContent {
  const k = konten ?? {};
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
  konten: Record<string, unknown> | null
): HomeDalil | null {
  const q = (
    konten as
      | { manhaj?: { dalilQuran?: Record<string, unknown> } }
      | undefined
  )?.manhaj?.dalilQuran;
  if (!q) return null;
  const arab = typeof q.arab === 'string' ? q.arab : '';
  const terjemahan =
    typeof q.terjemahan === 'string' ? q.terjemahan : '';
  const sumber = typeof q.sumber === 'string' ? q.sumber : '';
  if (!arab && !terjemahan) return null;
  return { arab, terjemahan, sumber };
}

// ---- halaman statis (beranda / tentang) ----
async function getHalamanKonten(
  kunci: string
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('konten')
      .eq('status', 'terbit')
      .eq('kunci', kunci)
      .maybeSingle();
    if (!error && data) {
      return (data as { konten?: Record<string, unknown> }).konten ?? null;
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return null;
}

// ---- programs (format sama seperti /api/programs) ----
type ProgramDbRow = {
  id: string;
  slug: string;
  judul: string;
  ringkasan?: string;
  deskripsi?: string;
  ikon?: string;
  gambar?: string;
  urutan?: number;
  tampil_beranda?: boolean;
  metadata?: Record<string, unknown>;
};

function formatProgram(p: ProgramDbRow) {
  const meta = (p.metadata || {}) as Record<string, unknown>;
  const href =
    p.slug === 'pembebasan-lahan' ? '/pembebasan-lahan' : `/program/${p.slug}`;
  return {
    id: p.id,
    slug: p.slug,
    judul: p.judul,
    ringkasan: p.ringkasan || '',
    deskripsi: p.deskripsi || '',
    kategori: (meta.kategori as string) || 'Program',
    ikon: p.ikon || 'BookOpen',
    icon: p.ikon || 'BookOpen',
    gambar: p.gambar || '',
    highlight:
      (meta.biaya_label as string) || p.ringkasan?.slice(0, 30) || 'Program YIMI',
    targetUsia: (meta.target_usia as string) || 'Semua Usia',
    tag: (meta.kategori as string) || 'Dakwah & Sosial',
    href,
    tampil_beranda: p.tampil_beranda !== false,
    metadata: meta,
  };
}

function terapkanTarifLahan<T extends { slug?: string; highlight?: string }>(
  list: T[],
  tarifLabel: string
): T[] {
  if (!tarifLabel) return list;
  return list.map((p) =>
    p.slug === 'pembebasan-lahan' ? { ...p, highlight: tarifLabel } : p
  );
}

async function getTarifLahanLabel(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('wakaf_lahan')
      .select('harga_per_meter')
      .limit(1)
      .maybeSingle();
    const dariCms =
      !error && data
        ? Number((data as { harga_per_meter?: unknown }).harga_per_meter)
        : 0;
    const perMeter =
      dariCms > 0 ? dariCms : Number(landFallback.hargaPerMeter) || 0;
    if (perMeter > 0) return `${formatRupiah(perMeter)} / m²`;
  } catch {
    /* abaikan */
  }
  const cadangan = Number(landFallback.hargaPerMeter) || 0;
  return cadangan > 0 ? `${formatRupiah(cadangan)} / m²` : '';
}

async function getPrograms(): Promise<unknown[]> {
  const tarifLabel = await getTarifLahanLabel();
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(
        'id,slug,judul,ringkasan,deskripsi,ikon,gambar,urutan,tampil_beranda,metadata'
      )
      .eq('is_archived', false)
      .order('urutan', { ascending: true });
    if (!error && data) {
      return terapkanTarifLahan(
        (data as ProgramDbRow[]).map(formatProgram),
        tarifLabel
      );
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return terapkanTarifLahan(
    fallbackPrograms as { slug?: string; highlight?: string }[],
    tarifLabel
  );
}

// ---- campaign lahan (format sama seperti /api/lahan; tanpa land_updates,
// beranda tidak memakainya) ----
async function getCampaign(): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from('wakaf_lahan')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      const c = data as Record<string, unknown>;
      const meta = (c.metadata || {}) as Record<string, unknown>;
      const arr = (k: string, fb: unknown) =>
        Array.isArray(meta[k]) ? meta[k] : fb;
      const str = (k: string, fb: string) =>
        typeof meta[k] === 'string' && (meta[k] as string).trim()
          ? (meta[k] as string)
          : fb;
      return {
        id: c.id,
        judul: (c.judul as string) || landFallback.judul,
        subjudul: str('subjudul', landFallback.subjudul),
        lokasi: (c.lokasi as string) || landFallback.lokasi,
        luasTargetM2:
          Number(c.luas_target_m2) || landFallback.luasTargetM2,
        hargaPerMeter:
          Number(c.harga_per_meter) || landFallback.hargaPerMeter,
        targetDana: Number(c.target_dana) || landFallback.targetDana,
        terkumpul: Number(c.terkumpul) || 0,
        diperbaruiPada:
          (c.diperbarui_pada as string) ||
          new Date().toISOString().split('T')[0],
        paketWakaf: arr('paket_wakaf', landFallback.paketWakaf),
        paketJudul: str(
          'paket_judul',
          'Pilihan Paket Wakaf Tanah'
        ),
        paketSubjudul: str(
          'paket_subjudul',
          'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.'
        ),
        rencanaPenggunaan: arr(
          'rencana_penggunaan',
          landFallback.rencanaPenggunaan
        ),
        rencanaJudul: str(
          'rencana_judul',
          'Peruntukan & Rencana Pembangunan'
        ),
        rencanaSubjudul: str(
          'rencana_subjudul',
          'Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.'
        ),
        tahapan: arr('tahapan', landFallback.tahapan),
        tahapanJudul: str('tahapan_judul', 'Tahapan Eksekusi Lahan'),
        tahapanSubjudul: str(
          'tahapan_subjudul',
          'Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.'
        ),
        faq: arr('faq', landFallback.faq),
        faqJudul: str('faq_judul', 'Pertanyaan yang Sering Diajukan'),
        faqSubjudul: str(
          'faq_subjudul',
          'Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.'
        ),
        metadata: meta,
      };
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return {
    judul: landFallback.judul,
    subjudul: landFallback.subjudul,
    lokasi: landFallback.lokasi,
    luasTargetM2: landFallback.luasTargetM2,
    hargaPerMeter: landFallback.hargaPerMeter,
    targetDana: landFallback.targetDana,
    terkumpul: landFallback.terkumpul,
    diperbaruiPada: landFallback.diperbaruiPada,
    paketWakaf: landFallback.paketWakaf,
    paketJudul: 'Pilihan Paket Wakaf Tanah',
    paketSubjudul:
      'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.',
    rencanaPenggunaan: landFallback.rencanaPenggunaan,
    rencanaJudul: 'Peruntukan & Rencana Pembangunan',
    rencanaSubjudul:
      'Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.',
    tahapan: landFallback.tahapan,
    tahapanJudul: 'Tahapan Eksekusi Lahan',
    tahapanSubjudul:
      'Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.',
    faq: landFallback.faq,
    faqJudul: 'Pertanyaan yang Sering Diajukan',
    faqSubjudul:
      'Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.',
  };
}

// ---- kajian ----
async function getKajian(): Promise<unknown[]> {
  try {
    const { data, error } = await supabase
      .from('jadwal_kajian')
      .select('*')
      .order('tanggal', { ascending: true })
      .limit(200);
    if (!error && data) {
      return saringKajianAktif(data as { tanggal?: string }[]);
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return saringKajianAktif(kajianFallback as { tanggal?: string }[]);
}

// ---- berita (SLIM: hanya 3 kartu beranda, tanpa isi lengkap & tanpa
// query visitor_logs — kartu tidak menampilkan views/likes) ----
async function getNews(): Promise<unknown[]> {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select(
        'id,slug,judul,terbit_pada,created_at,penulis,kategori,gambar_utama,ringkasan,isi'
      )
      .eq('status', 'terbit')
      .order('terbit_pada', { ascending: false })
      .limit(3);
    if (!error && data) {
      return (data as Record<string, unknown>[]).map((post) => {
        const { cleanIsi, galeri } = extractGalleryFromPost(
          post.gambar_utama as string | null,
          post.isi as string | null
        );
        return {
          id: post.id,
          slug: post.slug,
          judul: post.judul,
          tanggal:
            (post.terbit_pada as string) ||
            ((post.created_at as string)
              ? (post.created_at as string).split('T')[0]
              : '2026-10-09'),
          penulis: (post.penulis as string) || 'Tim Dakwah YIMI',
          kategori: (post.kategori as string) || 'Umum',
          gambar:
            galeri[0] ||
            (post.gambar_utama as string) ||
            'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop',
          galeri,
          views: 0,
          likes: 0,
          ringkasan:
            (post.ringkasan as string) ||
            (cleanIsi ? cleanIsi.slice(0, 160) + '...' : 'Warta kegiatan dan dakwah Yayasan Insan Muslim Istiqomah.'),
          konten: [],
          ayatRujukan: '',
        };
      });
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return fallbackNewsCard();
}

function fallbackNewsCard(): unknown[] {
  // Fallback lokal (content/news/index.json) — bentuknya sudah kartu.
  return (fallbackNews as Record<string, unknown>[]).slice(0, 3);
}

// ---- galeri ----
async function getGallery(): Promise<unknown[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('id,judul,gambar,kategori,keterangan,deskripsi,izin_orang_tua,tanggal')
      .eq('tampil_publik', true)
      .eq('tampil_beranda', true)
      .order('urutan', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6);
    if (!error && data) {
      return (data as Record<string, unknown>[]).filter(
        (item) =>
          !(
            (item.kategori as string)?.includes('TK') &&
            !item.izin_orang_tua
          )
      );
    }
  } catch {
    /* abaikan — fallback di bawah */
  }
  return (galleryFallback as Record<string, unknown>[])
    .filter((i) => i.izinOrangTua === true)
    .slice(0, 6)
    .map((f) => ({
      id: f.id,
      judul: f.judul,
      keterangan: f.deskripsi,
      gambar: f.gambar,
      kategori: f.kategori,
      izin_orang_tua: f.izinOrangTua,
      tampil_publik: true,
      tampil_beranda: true,
    }));
}

export async function getHomeData(): Promise<HomeData> {
  const [berandaKonten, tentangKonten, programs, campaign, kajian, news, gallery] =
    await Promise.all([
      getHalamanKonten('beranda'),
      getHalamanKonten('tentang'),
      getPrograms(),
      getCampaign(),
      getKajian(),
      getNews(),
      getGallery(),
    ]);

  return {
    hero: extractHero(berandaKonten),
    dalil: extractDalil(
      tentangKonten ?? (aboutFallback as Record<string, unknown>)
    ),
    programs: (programs as Record<string, unknown>[]).filter(
      (p) => (p as { tampil_beranda?: boolean }).tampil_beranda !== false
    ),
    campaign,
    kajian,
    news,
    gallery,
  };
}
