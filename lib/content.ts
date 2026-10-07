import siteData from '@/content/site.json';
import aboutData from '@/content/about.json';
import programsData from '@/content/programs/index.json';
import tkPaudData from '@/content/programs/tk-paud.json';
import jumatBerkahData from '@/content/programs/jumat-berkah.json';
import kajianProgramData from '@/content/programs/kajian.json';
import landCampaignData from '@/content/land-campaign.json';
import kajianScheduleData from '@/content/kajian.json';
import galleryData from '@/content/gallery.json';
import newsData from '@/content/news/index.json';

export type SiteData = typeof siteData;
export type AboutData = typeof aboutData;
export type ProgramItem = (typeof programsData)[number];
export type LandCampaignData = typeof landCampaignData;
export type KajianItem = (typeof kajianScheduleData)[number];
export type GalleryItem = (typeof galleryData)[number];
export type NewsItem = (typeof newsData)[number];

export function getSiteData(): SiteData {
  return siteData;
}

export function getAboutData(): AboutData {
  return aboutData;
}

export function getProgramsList(): ProgramItem[] {
  return programsData;
}

export function getProgramDetail(slug: string) {
  if (slug === 'tk-paud') return tkPaudData;
  if (slug === 'jumat-berkah') return jumatBerkahData;
  if (slug === 'kajian') return kajianProgramData;
  return null;
}

export function getLandCampaignData(): LandCampaignData {
  return landCampaignData;
}

export function getKajianList(): KajianItem[] {
  return kajianScheduleData;
}

export function getGalleryList(kategori?: string): GalleryItem[] {
  // Respect privacy filter: only items with izinOrangTua === true
  const safeItems = galleryData.filter((item) => item.izinOrangTua === true);
  if (!kategori || kategori === 'Semua') {
    return safeItems;
  }
  return safeItems.filter((item) => item.kategori.toLowerCase() === kategori.toLowerCase());
}

export function getNewsList(kategori?: string): NewsItem[] {
  if (!kategori || kategori === 'Semua') {
    return newsData;
  }
  return newsData.filter((item) => item.kategori.toLowerCase() === kategori.toLowerCase());
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsData.find((item) => item.slug === slug);
}
