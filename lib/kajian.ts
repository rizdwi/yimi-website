/**
 * Helper jadwal kajian untuk WEB UTAMA.
 *
 * Aturan: jadwal yang tanggalnya sudah terlewat disembunyikan dari web utama,
 * tetapi tetap tersimpan di CMS sebagai arsip histori (CMS memakai endpoint
 * /api/admin/kajian yang TIDAK memakai filter ini).
 */

/** Tanggal hari ini dalam WIB, format YYYY-MM-DD. */
export function tanggalHariIniWIB(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * true bila jadwal sudah terlewat (tanggal < hari ini WIB).
 * Jadwal hari ini tetap tampil seharian. Tanggal kosong/tidak valid
 * tidak disembunyikan (jangan buang data yang tidak bisa dinilai).
 */
export function isKajianTerlewat(tanggal?: string): boolean {
  if (!tanggal || tanggal.length < 10) return false;
  return tanggal.slice(0, 10) < tanggalHariIniWIB();
}

/** Saring daftar kajian: hanya yang belum terlewat (termasuk hari ini). */
export function saringKajianAktif<T extends { tanggal?: string }>(
  list: T[]
): T[] {
  return list.filter((item) => !isKajianTerlewat(item.tanggal));
}
