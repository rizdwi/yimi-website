'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Eye,
  Heart,
  Share2,
  Copy,
  Check,
  Send,
} from 'lucide-react';

interface ArticleInteractionsProps {
  slug: string;
  judul: string;
  ringkasan?: string;
  initialViews?: number;
  initialLikes?: number;
  // Jika true, tampilkan versi ringkas untuk meta bar di bawah judul artikel
  variant?: 'full' | 'meta-bar';
}

export function ArticleInteractions({
  slug,
  judul,
  ringkasan,
  initialViews = 0,
  initialLikes = 0,
  variant = 'full',
}: ArticleInteractionsProps) {
  const [views, setViews] = useState<number>(initialViews);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Ambil data view & like terkini dari server + catat tayangan (1x per sesi)
  useEffect(() => {
    let isMounted = true;

    async function recordViewAndFetchStats() {
      // Periksa preferensi like lokal di browser
      try {
        const stored = localStorage.getItem(`yimi_like_${slug}`);
        if (stored === 'true' && isMounted) {
          setHasLiked(true);
        }
      } catch {
        // Ignore
      }

      try {
        const sessionKey = `yimi_viewed_${slug}`;
        const hasViewedInSession = sessionStorage.getItem(sessionKey);

        const url = hasViewedInSession
          ? `/api/berita/stats?slug=${encodeURIComponent(slug)}`
          : '/api/berita/stats';

        const options: RequestInit = hasViewedInSession
          ? { cache: 'no-store' }
          : {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slug,
                action: 'view',
                referrer: typeof document !== 'undefined' ? document.referrer : '',
              }),
            };

        const res = await fetch(url, options);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (typeof data.views === 'number') setViews(data.views);
            if (typeof data.likes === 'number') setLikes(data.likes);
            if (typeof data.userLiked === 'boolean' && data.userLiked) {
              setHasLiked(true);
              try {
                localStorage.setItem(`yimi_like_${slug}`, 'true');
              } catch {
                // Ignore
              }
            }
          }
          if (!hasViewedInSession) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (err) {
        console.error('Gagal memuat statistik warta:', err);
      }
    }

    recordViewAndFetchStats();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Handler Like / Unlike interaktif
  const handleToggleLike = useCallback(async () => {
    const nextState = !hasLiked;
    // Optimistic UI update
    setHasLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        localStorage.setItem(`yimi_like_${slug}`, 'true');
      } else {
        localStorage.removeItem(`yimi_like_${slug}`);
      }
    } catch {
      // Ignore
    }

    try {
      const res = await fetch('/api/berita/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: nextState ? 'like' : 'unlike',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        startTransition(() => {
          if (typeof data.likes === 'number') setLikes(data.likes);
          if (typeof data.userLiked === 'boolean') setHasLiked(data.userLiked);
        });
      }
    } catch (err) {
      console.error('Gagal memperbarui suka:', err);
    }
  }, [hasLiked, slug]);

  // Helper untuk mendapatkan URL artikel saat ini
  const getArticleUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://yimi.my.id/berita/${slug}`;
  }, [slug]);

  // Handler Salin Tautan
  const handleCopyLink = useCallback(async () => {
    const urlToCopy = getArticleUrl();

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback jika clipboard API dicegah browser
      const input = document.createElement('input');
      input.value = urlToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [getArticleUrl]);

  // Handler Berbagi ke Media Sosial
  const handleSharePlatform = useCallback(
    (platform: 'wa' | 'tg' | 'fb' | 'x' | 'in') => {
      const url = getArticleUrl();
      const title = encodeURIComponent(judul);
      const u = encodeURIComponent(url);
      const summary = encodeURIComponent(ringkasan || judul);

      let target = '';
      if (platform === 'wa') {
        target = `https://api.whatsapp.com/send?text=${title}%0A%0A${summary}%0A%0A${u}`;
      } else if (platform === 'tg') {
        target = `https://t.me/share/url?url=${u}&text=${title}`;
      } else if (platform === 'fb') {
        target = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
      } else if (platform === 'x') {
        target = `https://twitter.com/intent/tweet?url=${u}&text=${title}`;
      } else if (platform === 'in') {
        target = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
      }

      if (target && typeof window !== 'undefined') {
        window.open(target, '_blank', 'noopener,noreferrer');
      }
    },
    [judul, ringkasan, getArticleUrl]
  );

  // Handler Native Share (Mobile)
  const handleNativeShare = useCallback(async () => {
    const url = getArticleUrl();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: judul,
          text: ringkasan || `Baca warta menarik dari YIMI: "${judul}"`,
          url,
        });
        return;
      } catch {
        return;
      }
    }
    handleCopyLink();
  }, [judul, ringkasan, getArticleUrl, handleCopyLink]);

  // Variant A: Meta Bar di Header Artikel (Tepat di bawah judul/tanggal)
  if (variant === 'meta-bar') {
    return (
      <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
        {/* Indikator Jumlah Dilihat / Views */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100/90 text-neutral-700">
          <Eye className="w-3.5 h-3.5 text-neutral-500" />
          <span>{views > 0 ? `${views.toLocaleString('id-ID')} dilihat` : 'Baru diterbitkan'}</span>
        </div>

        {/* Tombol Mini Suka */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            hasLiked
              ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
              : 'bg-neutral-100/90 text-neutral-600 hover:bg-rose-50 hover:text-rose-600'
          }`}
          title={hasLiked ? 'Batalkan suka' : 'Sukai artikel ini'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-neutral-500'
            }`}
          />
          <span>{likes > 0 ? likes.toLocaleString('id-ID') : 'Suka'}</span>
        </button>
      </div>
    );
  }

  // Variant B: Kotak Interaksi & Media Sosial Lengkap (Bawah Artikel)
  return (
    <section className="my-10 pt-8 border-t border-neutral-200/90">
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-br from-neutral-50 via-white to-neutral-50/80 border border-neutral-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Kolom Kiri: Statistik & Tombol Suka Interaktif */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tombol Suka Utama */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95 ${
                hasLiked
                  ? 'bg-rose-500 text-white shadow-rose-200'
                  : 'bg-white text-neutral-700 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 hover:bg-rose-50/50'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-120 ${
                  hasLiked ? 'fill-white text-white' : 'text-neutral-400 group-hover:text-rose-600'
                }`}
              />
              <span>{hasLiked ? 'Disukai' : 'Sukai Artikel'}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                  hasLiked ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600 group-hover:bg-rose-100 group-hover:text-rose-700'
                }`}
              >
                {likes.toLocaleString('id-ID')}
              </span>
            </button>

            {/* Badge Statistik Tayangan */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200/80 text-neutral-600 text-xs font-semibold shadow-2xs">
              <Eye className="w-4 h-4 text-yimi-blue-600" />
              <span>
                {views > 0 ? `${views.toLocaleString('id-ID')} Kali Dibaca` : 'Sedang Dibaca'}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Tombol Berbagi Media Sosial */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-yimi-blue-600" />
              <span>Bagikan Kebaikan:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => handleSharePlatform('wa')}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-colors cursor-pointer border border-[#25D366]/20 shadow-2xs"
                title="Bagikan ke WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => handleSharePlatform('tg')}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-colors cursor-pointer border border-[#0088cc]/20 shadow-2xs"
                title="Bagikan ke Telegram"
              >
                <TelegramIcon className="w-4 h-4" />
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSharePlatform('fb')}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors cursor-pointer border border-[#1877F2]/20 shadow-2xs"
                title="Bagikan ke Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={() => handleSharePlatform('x')}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-neutral-900/10 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer border border-neutral-300 shadow-2xs"
                title="Bagikan ke X (Twitter)"
              >
                <TwitterXIcon className="w-4 h-4" />
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSharePlatform('in')}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer border border-[#0A66C2]/20 shadow-2xs"
                title="Bagikan ke LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </button>

              {/* Salin Tautan */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
                  copied
                    ? 'bg-yimi-green-500 text-white border-yimi-green-600'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                }`}
                title="Salin Tautan Artikel"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              {/* Tombol Bagikan Native (Membuka dialog share HP: WhatsApp Status, IG, dll) */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-yimi-blue-800 text-white hover:bg-yimi-blue-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Bagikan via Aplikasi Lain"
              >
                <Send className="w-3 h-3" />
                <span>Lainnya</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Komponen Ikon Vektor Brand Media Sosial Ringan & Presisi
function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterXIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
