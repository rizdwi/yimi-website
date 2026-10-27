'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SiteSettings } from '@/lib/types';
import siteFallback from '@/content/site.json';

interface SiteSettingsContextType {
  settings: Partial<SiteSettings> | null;
  logoUrl: string;
  fotoYayasanUrl: string;
  namaYayasan: string;
  singkatan: string;
  tagline: string;
  whatsapp: string;
  email: string;
  alamat: string;
  jamOperasional: string;
  mapsEmbed: string;
  bank1Nama: string;
  bank1Rekening: string;
  bank1An: string;
  bank2Nama: string;
  bank2Rekening: string;
  bank2An: string;
  qrisImage: string;
  sosmed: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
    facebook?: string;
  };
  refreshSettings: () => Promise<void>;
}

const defaultContext: SiteSettingsContextType = {
  settings: null,
  logoUrl: '/logo/logo-yimi.svg',
  fotoYayasanUrl: '',
  namaYayasan: siteFallback.namaLengkap,
  singkatan: siteFallback.singkatan,
  tagline: siteFallback.tagline,
  whatsapp: siteFallback.kontak.whatsapp,
  email: siteFallback.kontak.email,
  alamat: siteFallback.kontak.alamat,
  jamOperasional: siteFallback.kontak.jamOperasional,
  mapsEmbed: siteFallback.kontak.mapsEmbed,
  bank1Nama: siteFallback.donasi.bank,
  bank1Rekening: siteFallback.donasi.noRekening,
  bank1An: siteFallback.donasi.atasNama,
  bank2Nama: siteFallback.donasi.rekeningLain.bank,
  bank2Rekening: siteFallback.donasi.rekeningLain.noRekening,
  bank2An: siteFallback.donasi.rekeningLain.atasNama,
  qrisImage: '',
  sosmed: siteFallback.sosmed,
  refreshSettings: async () => {},
};

const SiteSettingsContext = createContext<SiteSettingsContextType>(defaultContext);

export function SiteSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<SiteSettings> | null;
}) {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(
    initialSettings || null
  );

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to refresh site settings:', err);
    }
  }, []);

  // TIDAK ada fetch client-side otomatis di mount (dihapus 2026-10-27).
  // Dulu: useEffect fetch /api/site-settings di setiap load — request +
  // setSettings + re-render itu berebut main thread & bandwidth tepat saat
  // logo (elemen LCP) berusaha melukis, menyumbang "penundaan render
  // elemen" 1.500 md di PageSpeed. Settings sudah tersedia dari server via
  // initialSettings dan ISR revalidasi 60 dtk, jadi fetch ini murni
  // redundan. refreshSettings tetap tersedia untuk pemakaian manual.

  const logoUrl =
    settings?.logo_yayasan ||
    settings?.foto_yayasan ||
    '/logo/logo-yimi.svg';

  const fotoYayasanUrl = settings?.foto_yayasan || '';
  const namaYayasan = settings?.nama_lengkap || siteFallback.namaLengkap;
  const singkatan = settings?.singkatan || siteFallback.singkatan;
  const tagline = settings?.tagline || siteFallback.tagline;
  const whatsapp = settings?.whatsapp || siteFallback.kontak.whatsapp;
  const email = settings?.email || siteFallback.kontak.email;
  const alamat = settings?.alamat || siteFallback.kontak.alamat;
  const jamOperasional = settings?.jam_operasional || siteFallback.kontak.jamOperasional;
  const mapsEmbed = settings?.maps_embed || siteFallback.kontak.mapsEmbed;

  const bank1Nama = settings?.bank_1_nama || siteFallback.donasi.bank;
  const bank1Rekening = settings?.bank_1_rekening || siteFallback.donasi.noRekening;
  const bank1An = settings?.bank_1_an || siteFallback.donasi.atasNama;

  const bank2Nama = settings?.bank_2_nama || siteFallback.donasi.rekeningLain.bank;
  const bank2Rekening = settings?.bank_2_rekening || siteFallback.donasi.rekeningLain.noRekening;
  const bank2An = settings?.bank_2_an || siteFallback.donasi.rekeningLain.atasNama;

  const qrisImage = settings?.qris_image || '';
  const sosmed = settings?.sosmed || siteFallback.sosmed;

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        logoUrl,
        fotoYayasanUrl,
        namaYayasan,
        singkatan,
        tagline,
        whatsapp,
        email,
        alamat,
        jamOperasional,
        mapsEmbed,
        bank1Nama,
        bank1Rekening,
        bank1An,
        bank2Nama,
        bank2Rekening,
        bank2An,
        qrisImage,
        sosmed,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
