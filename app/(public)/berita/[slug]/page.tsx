import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Share2, BookOpen, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatTanggal } from '@/lib/format';
import { constructMetadata } from '@/lib/seo';
import { supabase } from '@/lib/supabase';
import newsData from '@/content/news/index.json';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

interface ArticleItem {
  id: string;
  slug: string;
  judul: string;
  tanggal: string;
  penulis: string;
  kategori: string;
  gambar: string;
  ringkasan: string;
  konten: string[];
  ayatRujukan?: string;
}

/** Deteksi baris subjudul: huruf kapital semua, pendek, dominan huruf. */
function isHeadingLine(text: string): boolean {
  const t = text.trim();
  if (t.length < 4 || t.length > 140) return false;
  const letters = t.replace(/[^A-Za-zÀ-ÿĀ-ž]/g, '');
  if (letters.length < 4) return false;
  return letters === letters.toUpperCase();
}

/** Render penekanan **teks** menjadi <strong>. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-bold text-yimi-blue-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

async function getArticle(slug: string): Promise<ArticleItem | null> {
  try {
    const { data: post, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'terbit')
      .maybeSingle();

    if (!error && post) {
      return {
        id: post.id,
        slug: post.slug,
        judul: post.judul,
        tanggal: post.terbit_pada || (post.created_at ? post.created_at.split('T')[0] : '2026-10-09'),
        penulis: post.penulis || 'Tim Dakwah YIMI',
        kategori: post.kategori || 'Umum',
        gambar:
          post.gambar_utama ||
          'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop',
        ringkasan:
          post.ringkasan ||
          (post.isi ? post.isi.slice(0, 160) + '...' : 'Warta kegiatan dan dakwah Yayasan Insan Muslim Istiqomah.'),
        konten: post.isi
          ? post.isi.split('\n\n').map((p: string) => p.trim()).filter(Boolean)
          : [],
        ayatRujukan: '',
      };
    }
  } catch (err) {
    console.error('Error fetching article by slug from Supabase:', err);
  }

  // Fallback to local JSON
  const localArticle = newsData.find((item) => item.slug === slug);
  return localArticle || null;
}

async function getRelatedArticles(currentSlug: string): Promise<ArticleItem[]> {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('status', 'terbit')
      .neq('slug', currentSlug)
      .order('terbit_pada', { ascending: false })
      .limit(2);

    if (!error && data && data.length > 0) {
      return data.map((post) => ({
        id: post.id,
        slug: post.slug,
        judul: post.judul,
        tanggal: post.terbit_pada || (post.created_at ? post.created_at.split('T')[0] : '2026-10-09'),
        penulis: post.penulis || 'Tim Dakwah YIMI',
        kategori: post.kategori || 'Umum',
        gambar:
          post.gambar_utama ||
          'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop',
        ringkasan: post.ringkasan || '',
        konten: [],
      }));
    }
  } catch (err) {
    console.error('Error fetching related articles from Supabase:', err);
  }

  return newsData
    .filter((item) => item.slug !== currentSlug)
    .slice(0, 2);
}

export async function generateStaticParams() {
  return newsData.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan - YIMI',
    };
  }

  return constructMetadata({
    title: article.judul,
    description: article.ringkasan,
    image: article.gambar,
  });
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.slug);
  const shareText = encodeURIComponent(`${article.judul}\n\nBaca selengkapnya di Website Resmi YIMI:`);

  return (
    <div className="pt-[72px] pb-24 bg-white">
      {/* Top Breadcrumb & Title Bar */}
      <section className="bg-neutral-100/70 border-b border-neutral-200/80 py-8">
        <div className="max-w-[800px] w-full mx-auto px-5">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs font-bold text-yimi-blue-600 hover:text-yimi-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Warta YIMI</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="blue">{article.kategori}</Badge>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatTanggal(article.tanggal)}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 leading-tight mb-4">
            {article.judul}
          </h1>

          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <User className="w-3.5 h-3.5 text-yimi-green-700" />
            <span className="font-semibold">{article.penulis}</span>
          </div>
        </div>
      </section>

      {/* Main Content Article (max-width 68ch as specified in design.md) */}
      <article className="max-w-[800px] w-full mx-auto px-5 pt-8">
        {/* Featured Image */}
        <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden mb-10 shadow-xs">
          <Image
            src={article.gambar}
            alt={article.judul}
            fill
            priority
            unoptimized={Boolean(article.gambar && article.gambar.includes('supabase.co'))}
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        {/* Prose text constrained to 68ch */}
        <div className="max-w-[68ch] mx-auto flex flex-col gap-6 text-neutral-800 text-base sm:text-lg leading-[1.85]">
          {article.konten.map((paragraf, idx) => {
            const isArabic = /[\u0600-\u06FF]/.test(paragraf);

            if (isArabic) {
              return (
                <div
                  key={idx}
                  className="my-4 p-6 rounded-2xl bg-yimi-blue-50/70 border border-yimi-blue-600/20 text-center"
                >
                  <p
                    lang="ar"
                    dir="rtl"
                    className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.9]"
                  >
                    {paragraf}
                  </p>
                </div>
              );
            }

            if (isHeadingLine(paragraf)) {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-extrabold text-yimi-blue-800 leading-snug mt-10 mb-2"
                >
                  {renderInline(paragraf)}
                </h2>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {renderInline(paragraf)}
              </p>
            );
          })}

          {/* Ayat / Hadits Rujukan box if available */}
          {article.ayatRujukan && (
            <div className="mt-6 p-6 rounded-2xl bg-neutral-50 border-l-4 border-yimi-green-500 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-yimi-green-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Rujukan Dalil
                </span>
                <p className="text-sm font-semibold text-yimi-blue-800">
                  {article.ayatRujukan}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="max-w-[68ch] mx-auto border-t border-b border-neutral-100 py-6 my-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Bagikan Kebaikan Ini:
          </span>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yimi-green-500 hover:bg-yimi-green-700 text-yimi-blue-800 hover:text-white font-bold text-xs transition-colors cursor-pointer w-fit"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan ke WhatsApp</span>
          </a>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-[68ch] mx-auto pt-6">
            <h3 className="text-xl font-bold text-yimi-blue-800 mb-6">
              Artikel Lainnya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <Card
                  key={rel.id}
                  hoverEffect
                  className="p-5 flex flex-col justify-between border-neutral-200/80"
                >
                  <div>
                    <Badge variant="blue" className="text-[10px] mb-2">
                      {rel.kategori}
                    </Badge>
                    <h4 className="text-sm font-bold text-yimi-blue-800 line-clamp-2 mb-2">
                      <Link href={`/berita/${rel.slug}`}>{rel.judul}</Link>
                    </h4>
                  </div>
                  <Link
                    href={`/berita/${rel.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-yimi-blue-600 hover:text-yimi-blue-800 pt-2"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
