export const FALLBACK_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80';

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
