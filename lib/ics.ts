export function generateIcsContent(kajian: {
  id: string;
  tema: string;
  pemateri: string;
  tempat: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;
  keterangan?: string;
}): string {
  // Approximate start and end based on date string (standard 2 hours event)
  const cleanDate = kajian.tanggal.replace(/-/g, '');
  const dtStart = `${cleanDate}T090000Z`;
  const dtEnd = `${cleanDate}T110000Z`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YIMI//Kajian Pekanan//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${kajian.id}-${cleanDate}@yimi.or.id`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Kajian YIMI: ${kajian.tema}`,
    `DESCRIPTION:Pemateri: ${kajian.pemateri}\\nWaktu: ${kajian.waktu}\\n${kajian.keterangan || ''}`,
    `LOCATION:${kajian.tempat}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(kajian: {
  id: string;
  tema: string;
  pemateri: string;
  tempat: string;
  tanggal: string;
  waktu: string;
  keterangan?: string;
}) {
  const content = generateIcsContent(kajian);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `kajian-${kajian.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
