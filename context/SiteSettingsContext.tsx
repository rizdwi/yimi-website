'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    // Jika initialSettings sudah tersedia dari SSR, lewati fetch awal di client
    if (initialSettings) return;

    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/site-settings');
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [initialSettings]);

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
