'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const navLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Tentang', href: '/tentang' },
  { name: 'Program', href: '/program' },
  { name: 'Pembebasan Lahan', href: '/pembebasan-lahan' },
  { name: 'Berita', href: '/berita' },
  { name: 'Galeri', href: '/galeri' },
  { name: 'Kontak', href: '/kontak' },
];

export function Navbar() {
  const { logoUrl, singkatan, namaYayasan } = useSiteSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  // Prevent background scrolling when mobile menu open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const isHome = pathname === '/';
  const showSolidNav = isScrolled || !isHome;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] flex items-center ${
          showSolidNav
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,40,70,0.08)] border-b border-yimi-blue-50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-green-500 rounded-lg"
          >
            <div className="relative w-11 h-11 shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt={`Logo ${singkatan}`}
                width={44}
                height={44}
                priority
                // unoptimized: samakan dengan logo hero — sajikan file statis
                // langsung, tanpa latensi endpoint /_next/image.
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-yimi-blue-800 leading-tight">
                {singkatan}
              </span>
              <span className="text-[11px] font-semibold text-neutral-500 tracking-wider uppercase hidden sm:block">
                {namaYayasan}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navigasi Utama">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors relative ${
                    isActive
                      ? 'text-yimi-blue-600 bg-yimi-blue-50'
                      : 'text-neutral-700 hover:text-yimi-blue-600 hover:bg-neutral-100/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Donasi Button (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-3">
            <Button
              href="/donasi"
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-yimi-blue-800 text-yimi-blue-800" />
              <span>Donasi</span>
            </Button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl text-yimi-blue-800 hover:bg-yimi-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-green-500"
              aria-label={isMobileOpen ? 'Tutup Menu' : 'Buka Menu'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] z-50 bg-white shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
      >
        <div className="flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={`Logo ${singkatan}`}
                  width={36}
                  height={36}
                  // unoptimized: samakan dengan logo hero — file statis langsung.
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-lg text-yimi-blue-800">{singkatan}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="flex flex-col gap-1.5 py-6" aria-label="Menu Mobile">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-yimi-blue-50 text-yimi-blue-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Drawer Footer CTA */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col gap-3">
          <Button
            href="/donasi"
            variant="secondary"
            size="md"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsMobileOpen(false)}
          >
            <Heart className="w-4 h-4 fill-yimi-blue-800" />
            <span>Infaq &amp; Donasi</span>
          </Button>

          <p className="text-xs text-center text-neutral-500">
            Dakwah di atas Sunnah sesuai pemahaman Salafus Shalih
          </p>
        </div>
      </div>
    </>
  );
}
