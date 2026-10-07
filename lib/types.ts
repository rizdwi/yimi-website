// ============================================================
// Model & Types untuk CMS dan Database YIMI
// ============================================================

export type ContentStatus = 'draf' | 'terjadwal' | 'terbit' | 'arsip';
export type KajianStatus = 'aktif' | 'batal';

export interface SiteSettings {
  id?: string;
  nama_lengkap: string;
  singkatan: string;
  tagline: string;
  whatsapp: string;
  email: string;
  alamat: string;
  maps_embed?: string;
  jam_operasional: string;
  bank_1_nama: string;
  bank_1_rekening: string;
  bank_1_an: string;
  bank_2_nama: string;
  bank_2_rekening: string;
  bank_2_an: string;
  qris_image: string;
  sosmed: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
    facebook?: string;
  };
  updated_at?: string;
  updated_by?: string;
}

export interface ProgramItem {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  deskripsi: string;
  ikon: string;
  gambar: string;
  urutan: number;
  tampil_beranda: boolean;
  is_archived: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface KajianItem {
  id: string;
  hari: string;
  tanggal: string;
  waktu: string;
  jam_mulai?: string;
  jam_selesai?: string;
  tema: string;
  pemateri: string;
  tempat: string;
  kategori: string;
  sifat: string;
  is_active: boolean;
  status: KajianStatus;
  alasan_batal?: string;
  created_at?: string;
}

export interface LandCampaignData {
  id: string;
  judul: string;
  lokasi: string;
  luas_target_m2: number;
  harga_per_meter: number;
  target_dana: number;
  terkumpul: number;
  diperbarui_pada: string;
  created_at?: string;
  updated_at?: string;
}

export interface LandUpdateItem {
  id: string;
  tanggal: string;
  nominal: number;
  catatan: string;
  gambar_url?: string;
  created_by: string;
  created_at?: string;
}

export interface NewsPostItem {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  isi: string;
  gambar_utama: string;
  kategori: string;
  penulis: string;
  status: ContentStatus;
  terbit_pada: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryPhotoItem {
  id: string;
  judul: string;
  keterangan: string;
  gambar: string;
  kategori: string;
  urutan: number;
  izin_orang_tua: boolean;
  tampil_publik: boolean;
  created_at?: string;
}

export interface ContactInboxItem {
  id: string;
  nama: string;
  kontak: string;
  kategori: string;
  pesan: string;
  status: string;
  dibaca: boolean;
  catatan_internal?: string;
  ip_address?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  waktu: string;
  pengguna: string;
  modul: string;
  entitas_id?: string;
  ringkasan: string;
  detail?: Record<string, unknown>;
}

export interface AdminUser {
  id: string;
  email: string;
  nama: string;
  role: string;
}
