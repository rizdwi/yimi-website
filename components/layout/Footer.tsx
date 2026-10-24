'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

export function Footer() {
  const {
    logoUrl,
    singkatan,
    namaYayasan,
    tagline,
    whatsapp,
    email,
    alamat,
    jamOperasional,
    bank1Nama,
    bank1Rekening,
    bank1An,
    bank2Nama,
    bank2Rekening,
    bank2An,
    sosmed,
    settings,
  } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  // Helper untuk cek link sosmed aktif
  const hasLink = (url?: string) => url && url.trim() !== '' && url.trim() !== '-';

  return (
    <footer className="bg-yimi-blue-800 text-white relative overflow-hidden">
      {/* Decorative subtle background star pattern */}
      <div
        className="absolute inset-0 bg-star8-pattern opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/15">
          {/* Col 1: Brand & Tagline */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative shrink-0 bg-white/10 rounded-xl p-1 backdrop-blur-xs flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={`Logo ${singkatan}`}
                  width={48}
                  height={48}
                  unoptimized={Boolean(logoUrl && logoUrl.endsWith('.svg'))}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white leading-tight">
                  {singkatan}
                </span>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Yayasan Dakwah &amp; Pendidikan
                </span>
              </div>
            </div>

            <p className="text-sm text-blue-100/90 leading-relaxed font-medium">
              {tagline || siteData.tagline}
            </p>

            <p className="text-xs text-blue-200/80 leading-relaxed">
              {settings?.tagline && settings.tagline !== tagline
                ? settings.tagline
                : 'Mengajak kaum muslimin kembali kepada pemurnian aqidah dan ibadah berlandaskan Al-Qur\'an dan As-Sunnah sesuai pemahaman Salafus Shalih.'}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-yimi-yellow-400">
              Navigasi Utama
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-blue-100">
              <li>
                <Link href="/" className="hover:text-white hover:underline transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-white hover:underline transition-colors">
                  Tentang Yayasan &amp; Manhaj
                </Link>
              </li>
              <li>
                <Link href="/program" className="hover:text-white hover:underline transition-colors">
                  Program Dakwah &amp; Sosial
                </Link>
              </li>
              <li>
                <Link
                  href="/pembebasan-lahan"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>Pembebasan Lahan</span>
                  <span className="bg-yimi-yellow-400 text-yimi-blue-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    Prioritas
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-white hover:underline transition-colors">
                  Kabar &amp; Artikel Dakwah
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-white hover:underline transition-colors">
                  Dokumentasi Galeri
                </Link>
              </li>
              <li>
                <Link href="/donasi" className="hover:text-white hover:underline transition-colors">
                  Rekening Infaq
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-yimi-yellow-400">
              Sekretariat &amp; Layanan
            </h3>
            <div className="flex flex-col gap-3 text-sm text-blue-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yimi-green-500 shrink-0 mt-1" />
                <span className="leading-snug">{alamat || siteData.kontak.alamat}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-yimi-green-500 shrink-0" />
                <a
                  href={`https://wa.me/${(whatsapp || siteData.kontak.whatsapp).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition-colors"
                >
                  {whatsapp || siteData.kontak.whatsappFormatted} (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-4 h-4 text-yimi-green-500 shrink-0" />
                <a
                  href={`mailto:${email || siteData.kontak.email}`}
                  className="hover:text-white hover:underline transition-colors break-all"
                >
                  {email || siteData.kontak.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-yimi-green-500 shrink-0" />
                <span>{jamOperasional || siteData.kontak.jamOperasional}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Rekening & Media Sosial */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-wider uppercase text-yimi-yellow-400">
              Infaq &amp; Sosial Media
            </h3>
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 flex flex-col gap-1">
              <span className="font-bold text-white text-sm">
                {bank1Nama || siteData.donasi.bank}
              </span>
              <span className="font-mono text-sm tracking-wider font-semibold text-yimi-yellow-400">
                {bank1Rekening || siteData.donasi.noRekening}
              </span>
              <span className="text-blue-200">
                a.n. {bank1An || siteData.donasi.atasNama}
              </span>
            </div>

            {hasLink(bank2Rekening) && bank2Rekening !== '-' && (
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-100 flex flex-col gap-1">
                <span className="font-bold text-white text-sm">
                  {bank2Nama || siteData.donasi.rekeningLain.bank}
                </span>
                <span className="font-mono text-sm tracking-wider font-semibold text-yimi-yellow-400">
                  {bank2Rekening}
                </span>
                <span className="text-blue-200">
                  a.n. {bank2An || siteData.donasi.rekeningLain.atasNama}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-semibold text-blue-200">
                Ikuti Media Dakwah Kami:
              </span>
              <div className="flex items-center gap-2.5">
                {hasLink(sosmed?.instagram) && (
                  <a
                    href={sosmed.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Instagram YIMI"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {hasLink(sosmed?.youtube) && (
                  <a
                    href={sosmed.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="YouTube YIMI"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {hasLink(sosmed?.facebook) && (
                  <a
                    href={sosmed.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Facebook YIMI"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {hasLink(sosmed?.telegram) && (
                  <a
                    href={sosmed.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Telegram YIMI"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" x2="11" y1="2" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policy */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/80">
          <p>
            &copy; {currentYear} {namaYayasan || siteData.namaLengkap} ({singkatan || siteData.singkatan}). Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <span>Dakwah di atas Sunnah</span>
            <span>•</span>
            <span>Sesuai Pemahaman Salafus Shalih</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
