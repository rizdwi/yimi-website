import { MetadataRoute } from 'next';
import newsData from '@/content/news/index.json';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface CmsPost {
  slug: string;
  terbit_pada?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Ambil artikel yang terbit dari CMS (tabel Supabase news_posts). Gagal -> array kosong (fallback lokal). */
async function getCmsPosts(): Promise<CmsPost[]> {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select('slug, terbit_pada, created_at, updated_at')
      .eq('status', 'terbit')
      .order('terbit_pada', { ascending: false });
    if (error || !data) return [];
    return data as CmsPost[];
  } catch {
    return [];
  }
}

function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/program`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/program/tk-paud`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/program/jumat-berkah`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/program/kajian`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/pembebasan-lahan`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/berita`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/galeri`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/donasi`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/kuitansi`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Gabung artikel lokal + artikel CMS, hilangkan duplikat slug.
  const cmsPosts = await getCmsPosts();
  const seen = new Set<string>();
  const newsRoutes: MetadataRoute.Sitemap = [];

  for (const post of cmsPosts) {
    if (!post.slug) continue;
    const finalSlug =
      post.slug === 'y'
        ? 'yayasan-islam-karawang-berdakwah-dan-mendidik-sesuai-sunnah-di-tengah-umat'
        : post.slug;
    if (seen.has(finalSlug)) continue;
    seen.add(post.slug);
    seen.add(finalSlug);
    newsRoutes.push({
      url: `${baseUrl}/berita/${finalSlug}`,
      lastModified: toDate(post.updated_at) || toDate(post.terbit_pada) || toDate(post.created_at) || now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const article of newsData as { slug: string; tanggal: string }[]) {
    if (!article.slug || seen.has(article.slug)) continue;
    seen.add(article.slug);
    newsRoutes.push({
      url: `${baseUrl}/berita/${article.slug}`,
      lastModified: toDate(article.tanggal) || now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return [...staticRoutes, ...newsRoutes];
}
