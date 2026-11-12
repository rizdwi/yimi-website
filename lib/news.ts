import { supabase } from '@/lib/supabase';
import fallbackNews from '@/content/news/index.json';

export const FALLBACK_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80';

export interface NewsListItem {
  id: string;
  slug: string;
  judul: string;
  tanggal: string;
  penulis: string;
  kategori: string;
  gambar: string;
  galeri?: string[];
  views?: number;
  likes?: number;
  ringkasan: string;
}

/**
 * Mengambil seluruh artikel terbit langsung di Server Component (untuk SSR & SEO).
 * Mengembalikan array artikel lengkap agar Googlebot langsung mengindeks seluruh tautan dan konten.
 */
export async function getAllNews(): Promise<NewsListItem[]> {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select('id, slug, judul, terbit_pada, created_at, penulis, kategori, gambar_utama, isi, ringkasan')
      .eq('status', 'terbit')
      .order('terbit_pada', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((post) => {
        const { cleanIsi, galeri } = extractGalleryFromPost(post.gambar_utama, post.isi);
        const finalSlug =
          post.slug === 'y'
            ? 'yayasan-islam-karawang-berdakwah-dan-mendidik-sesuai-sunnah-di-tengah-umat'
            : post.slug;
        return {
          id: post.id,
          slug: finalSlug,
          judul: post.judul,
          tanggal: post.terbit_pada || (post.created_at ? post.created_at.split('T')[0] : '2026-10-09'),
          penulis: post.penulis || 'Tim Dakwah YIMI',
          kategori: post.kategori || 'Umum',
          gambar: galeri[0] || post.gambar_utama || FALLBACK_NEWS_IMAGE,
          galeri,
          views: 0,
          likes: 0,
          ringkasan:
            post.ringkasan ||
            (cleanIsi ? cleanIsi.slice(0, 160) + '...' : 'Warta kegiatan dan dakwah Yayasan Insan Muslim Istiqomah.'),
        };
      });
    }
  } catch (err) {
    console.error('Failed to load news for SSR from Supabase:', err);
  }

  // Fallback lokal jika database tidak merespons
  return (fallbackNews as unknown as NewsListItem[]).map((n) => ({
    ...n,
    views: n.views || 0,
    likes: n.likes || 0,
  }));
}

/**
 * Mengekstrak daftar foto galeri/kegiatan dan membersihkan teks isi berita
 * dari penanda internal <!--GALLERY:[...]-->
 */
export function extractGalleryFromPost(
  gambarUtama?: string | null,
  isi?: string | null
): { cleanIsi: string; galeri: string[] } {
  let galeri: string[] = [];
  let cleanIsi = (isi || '').trim();

  // 1. Ekstrak dari penanda <!--GALLERY:[...]-->
  const match = cleanIsi.match(/<!--GALLERY:([\s\S]*?)-->/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        galeri = parsed
          .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
          .map((u) => u.trim());
      }
    } catch {
      // Abaikan jika format JSON tidak valid
    }
    cleanIsi = cleanIsi.replace(/<!--GALLERY:[\s\S]*?-->/g, '').trim();
  }

  // 2. Jika ada gambarUtama dan belum ada di dalam galeri, tambahkan di awal
  const cover = (gambarUtama || '').trim();
  if (cover) {
    if (!galeri.includes(cover)) {
      galeri = [cover, ...galeri];
    }
  }

  // 3. Jika galeri masih kosong dan ada cover fallback
  if (galeri.length === 0 && cover) {
    galeri = [cover];
  }

  return { cleanIsi, galeri };
}

/**
 * Membungkus array foto galeri ke dalam teks isi berita menggunakan tag aman
 * <!--GALLERY:[...]--> dan mengembalikan foto utama (sampul pertama)
 */
export function embedGalleryIntoPost(
  isi?: string | null,
  galeri?: string[] | null
): { cleanGambarUtama: string; packagedIsi: string } {
  const cleanIsi = (isi || '').replace(/<!--GALLERY:[\s\S]*?-->/g, '').trim();
  const validPhotos = (galeri || [])
    .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    .map((u) => u.trim());

  const cleanGambarUtama = validPhotos[0] || FALLBACK_NEWS_IMAGE;

  // Jika terdapat lebih dari 1 foto (misal 2, 3, atau lebih), simpan metadata galeri lengkap
  if (validPhotos.length > 1) {
    const packagedIsi = `${cleanIsi}\n\n<!--GALLERY:${JSON.stringify(validPhotos)}-->`;
    return { cleanGambarUtama, packagedIsi };
  }

  return { cleanGambarUtama, packagedIsi: cleanIsi };
}
