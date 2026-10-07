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
