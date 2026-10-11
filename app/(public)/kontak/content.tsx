'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

export default function KontakPage() {
  const { whatsapp, email, alamat, jamOperasional, mapsEmbed } = useSiteSettings();
  const [pageKontak, setPageKontak] = useState<{
    alamat?: string;
    jamOperasional?: string;
    mapsEmbed?: string;
  }>({});

  useEffect(() => {
    async function loadPageKontak() {
      try {
        const res = await fetch('/api/halaman?kunci=kontak', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.page?.konten) {
            setPageKontak(data.page.konten);
          }
        }
      } catch (err) {
        console.error('Failed to load page kontak:', err);
      }
    }
    loadPageKontak();
  }, []);

  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    kategori: 'Umum',
    pesan: '',
    honeypot: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return; // Anti-spam bot trap

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
        setSubmitted(true);
      }
    } catch {
      setErrorMsg('Gagal mengirimkan pesan. Silakan periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const activeWa = whatsapp || siteData.kontak.whatsapp;
  const activeEmail = email || siteData.kontak.email;
  const activeAlamat = pageKontak.alamat || alamat || siteData.kontak.alamat;
  const activeJam = pageKontak.jamOperasional || jamOperasional || siteData.kontak.jamOperasional;
  const activeMaps = pageKontak.mapsEmbed || mapsEmbed || siteData.kontak.mapsEmbed;

  const directWaUrl = `https://wa.me/${activeWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Assalamu’alaikum Warahmatullahi Wabarakatuh Pengurus YIMI, saya ingin bertanya terkait program yayasan.'
  )}`;

  return (
    <div className="pt-[72px]">
      {/* Subpage Hero */}
      <PageHero
        image="/images/banners/kontak.jpg"
        imageAlt="Gerbang masjid dengan lentera hangat di waktu senja"
        badge={
          <>
            <Phone className="w-3.5 h-3.5" />
            <span>Pusat Komunikasi</span>
          </>
        }
        title="Hubungi Yayasan YIMI"
        subtitle="Kami siap menyambut silaturahim, konsultasi program pendidikan, pendaftaran kajian, maupun konfirmasi donasi."
      />

      {/* Main Two Columns */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 6 cols: Info Kontak & Google Maps */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 mb-2">
                  Sekretariat &amp; Layanan Jamaah
                </h2>
                <p className="text-sm text-neutral-600">
                  Kunjungi kantor yayasan kami atau hubungi kami melalui saluran berikut:
                </p>
              </div>

              {/* Contact Cards */}
              <div className="flex flex-col gap-4">
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-yimi-blue-800 mb-1">
                      Alamat Sekretariat
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {activeAlamat}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-yimi-blue-800 mb-1">
                      Jam Operasional Kantor
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {activeJam}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yimi-green-50 text-yimi-green-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-yimi-blue-800 mb-1">
                      Layanan WhatsApp Resmi
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-3">
                      Layanan respon cepat untuk informasi dan konsultasi.
                    </p>
                    <a
                      href={directWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-800 text-white font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp Pengurus ({activeWa})</span>
                    </a>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-yimi-blue-800 mb-1">
                      Surel (Email)
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600">
                      {activeEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed iframe */}
              <div className="rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs aspect-16/9 bg-neutral-200 relative">
                <iframe
                  title="Peta Lokasi Yayasan Insan Muslim Istiqomah"
                  src={activeMaps}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Right 6 cols: Formulir Pesan */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-xs">
                <div className="mb-8">
                  <h3 className="text-2xl font-extrabold text-yimi-blue-800 mb-2">
                    Kirim Pesan Silaturahim
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Silakan isi formulir di bawah ini. Tim pengurus kami akan segera menanggapi pertanyaan Anda.
                  </p>
                </div>

                {submitted ? (
                  <div className="py-12 px-6 rounded-2xl bg-yimi-blue-50 text-center flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-12 h-12 text-yimi-green-500" />
                    <h4 className="text-lg font-bold text-yimi-blue-800">
                      Jazakumullahu Khairan!
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-sm">
                      Pesan Anda telah berhasil kami terima. Kami akan segera menghubungi Anda kembali melalui kontak yang tertera.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          nama: '',
                          kontak: '',
                          kategori: 'Umum',
                          pesan: '',
                          honeypot: '',
                        });
                      }}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-yimi-blue-600 text-white font-bold text-xs hover:bg-yimi-blue-800 transition-colors cursor-pointer"
                    >
                      Kirim Pesan Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Honeypot field (hidden from view) */}
                    <input
                      type="text"
                      name="_gotcha"
                      value={formData.honeypot}
                      onChange={(e) =>
                        setFormData({ ...formData, honeypot: e.target.value })
                      }
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        Nama Lengkap <span className="text-yimi-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Abdullah bin Fulan"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-yimi-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        WhatsApp / Surel (Email){' '}
                        <span className="text-yimi-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 08123456789 atau email@domain.com"
                        value={formData.kontak}
                        onChange={(e) =>
                          setFormData({ ...formData, kontak: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-yimi-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        Kategori Keperluan
                      </label>
                      <select
                        value={formData.kategori}
                        onChange={(e) =>
                          setFormData({ ...formData, kategori: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-hidden focus:border-yimi-blue-600 focus:bg-white transition-colors"
                      >
                        <option value="Umum">Pertanyaan Umum</option>
                        <option value="TK-PAUD">Pendaftaran TK &amp; PAUD</option>
                        <option value="Kajian">Jadwal &amp; Majelis Kajian</option>
                        <option value="Donasi">Konfirmasi Donasi / Infaq</option>
                        <option value="Wakaf">Wakaf Pembebasan Lahan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        Isi Pesan <span className="text-yimi-red-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tuliskan pertanyaan atau permohonan informasi Anda di sini..."
                        value={formData.pesan}
                        onChange={(e) =>
                          setFormData({ ...formData, pesan: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-yimi-blue-600 focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-yimi-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                        {errorMsg}
                      </p>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{loading ? 'Mengirimkan...' : 'Kirimkan Pesan'}</span>
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
