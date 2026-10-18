export function formatRupiah(amount: number): string {
  if (amount === 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPersen(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  const p = Math.round((current / target) * 1000) / 10;
  return Math.min(100, Math.max(0, p));
}

/**
 * Konversi angka ke kalimat terbilang Bahasa Indonesia
 */
export function terbilangRupiah(nominal: number): string {
  if (nominal <= 0 || isNaN(nominal)) return 'Nol Rupiah';

  const angka = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function bilang(n: number): string {
    if (n < 12) return angka[n];
    if (n < 20) return bilang(n - 10) + ' Belas';
    if (n < 100) return bilang(Math.floor(n / 10)) + ' Puluh ' + bilang(n % 10);
    if (n < 200) return 'Seratus ' + bilang(n - 100);
    if (n < 1000) return bilang(Math.floor(n / 100)) + ' Ratus ' + bilang(n % 100);
    if (n < 2000) return 'Seribu ' + bilang(n - 1000);
    if (n < 1000000) return bilang(Math.floor(n / 1000)) + ' Ribu ' + bilang(n % 1000);
    if (n < 1000000000) return bilang(Math.floor(n / 1000000)) + ' Juta ' + bilang(n % 1000000);
    if (n < 1000000000000) return bilang(Math.floor(n / 1000000000)) + ' Miliar ' + bilang(n % 1000000000);
    return bilang(Math.floor(n / 1000000000000)) + ' Triliun ' + bilang(n % 1000000000000);
  }

  const hasil = bilang(Math.floor(nominal)).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}
