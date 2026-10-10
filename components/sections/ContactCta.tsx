'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

export function ContactCta() {
  const { whatsapp, email } = useSiteSettings();
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    kategori: 'Umum',
    pesan: '',
    honeypot: '', // anti-bot spam
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If bot filled the honeypot, silently reject
    if (formData.honeypot) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/kontak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          kontak: formData.kontak,
          kategori: formData.kategori,
          pesan: formData.pesan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengirim pesan.');
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMsg('Gagal mengirim pesan. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const activeWa = whatsapp || siteData.kontak.whatsapp;
  const activeEmail = email || siteData.kontak.email;

  const waPrefill = encodeURIComponent(
    `Bismillah, saya ${formData.nama || 'jamaah'} ingin bertanya seputar ${formData.kategori}.\n\nPesan:\n${formData.pesan || 'Mohon informasi seputar program yayasan.'}`
  );
  const waUrl = `https://wa.me/${activeWa}?text=${waPrefill}`;

  return (
    <section className="py-20 md:py-24 bg-yimi-blue-50/50 relative overflow-hidden">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Info Column */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500" />
              Silaturahim &amp; Informasi
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight leading-tight">
              Ingin Mengetahui Lebih Dekat Kegiatan YIMI?
            </h2>

            <p className="text-base text-neutral-600 leading-relaxed">
              Tim sekretariat yayasan siap melayani pertanyaan seputar pendaftaran santri TK/PAUD, jadwal kajian, titipan infaq Jumat Berkah, serta wakaf pembebasan lahan.
            </p>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-yimi-blue-800">
                    Layanan WhatsApp Pengurus
                  </h4>
                  <p className="text-xs text-neutral-500 mb-1">
                    Respons cepat di jam kerja (08.00 – 17.00 WIB)
                  </p>
                  <a
                    href={`https://wa.me/${activeWa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-yimi-blue-600 hover:underline"
                  >
                    {activeWa}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-yimi-blue-800">
                    Surat Elektronik
                  </h4>
                  <p className="text-xs text-neutral-500 mb-1">
                    Untuk urusan legalitas dan kerja sama resmi
                  </p>
                  <a
                    href={`mailto:${activeEmail}`}
                    className="text-sm font-bold text-yimi-blue-600 hover:underline"
                  >
                    {activeEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(31,47,107,0.08)] border border-yimi-blue-50">
            {isSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-yimi-green-500 mb-4" />
                <h3 className="text-xl font-bold text-yimi-blue-800 mb-2">
                  Jazakumullahu Khairan!
                </h3>
                <p className="text-sm text-neutral-600 max-w-sm mb-6">
                  Pesan Anda telah kami catat. Anda juga dapat melanjutkan obrolan langsung via WhatsApp agar lebih cepat diproses.
                </p>
                <Button
                  href={waUrl}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                  <span>Kirim ke WhatsApp Pengurus</span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-yimi-blue-800">
                  Kirim Pesan / Pertanyaan
                </h3>

                {/* Honeypot field (hidden from screen reader and user) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="hp_check">Jangan isi field ini:</label>
                  <input
                    type="text"
                    id="hp_check"
                    tabIndex={-1}
                    value={formData.honeypot}
                    onChange={(e) =>
                      setFormData({ ...formData, honeypot: e.target.value })
                    }
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nama"
                    className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5"
                  >
                    Nama Lengkap <span className="text-yimi-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="nama"
                    required
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    placeholder="Contoh: Abdullah"
                    className="w-full h-11 px-4 text-sm rounded-xl border border-neutral-200 focus:border-yimi-blue-600 focus:ring-2 focus:ring-yimi-green-500/30 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="kontak"
                      className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5"
                    >
                      No. WhatsApp / Email <span className="text-yimi-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="kontak"
                      required
                      value={formData.kontak}
                      onChange={(e) =>
                        setFormData({ ...formData, kontak: e.target.value })
                      }
                      placeholder="0812xxxx / email"
                      className="w-full h-11 px-4 text-sm rounded-xl border border-neutral-200 focus:border-yimi-blue-600 focus:ring-2 focus:ring-yimi-green-500/30 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="kategori"
                      className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5"
                    >
                      Perihal
                    </label>
                    <select
                      id="kategori"
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                      className="w-full h-11 px-3 text-sm rounded-xl border border-neutral-200 focus:border-yimi-blue-600 focus:ring-2 focus:ring-yimi-green-500/30 outline-none transition-colors bg-white"
                    >
                      <option value="Umum">Pertanyaan Umum</option>
                      <option value="Pendaftaran TK/PAUD">Pendaftaran TK / PAUD</option>
                      <option value="Jadwal Kajian">Jadwal Kajian</option>
                      <option value="Infaq & Wakaf Lahan">Infaq &amp; Wakaf Lahan</option>
                      <option value="Jumat Berkah">Jumat Berkah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pesan"
                    className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5"
                  >
                    Isi Pesan <span className="text-yimi-red-600">*</span>
                  </label>
                  <textarea
                    id="pesan"
                    required
                    rows={4}
                    value={formData.pesan}
                    onChange={(e) =>
                      setFormData({ ...formData, pesan: e.target.value })
                    }
                    placeholder="Tuliskan pertanyaan atau permohonan informasi Anda..."
                    className="w-full p-4 text-sm rounded-xl border border-neutral-200 focus:border-yimi-blue-600 focus:ring-2 focus:ring-yimi-green-500/30 outline-none transition-colors resize-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-yimi-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Mengirim...' : 'Kirim Pesan'}</span>
                  </Button>

                  <Button
                    href={waUrl}
                    variant="secondary"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-yimi-blue-800" />
                    <span>Chat WA</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
