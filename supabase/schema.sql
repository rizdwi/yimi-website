-- ============================================================
-- Skema Database PostgreSQL untuk Yayasan Insan Muslim Istiqomah (YIMI)
-- Supabase Schema & Row Level Security (RLS)
-- ============================================================

-- 1. Tabel Pesan Kontak / Formulir Silaturahim
CREATE TABLE IF NOT EXISTS public.kontak_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    kontak VARCHAR(255) NOT NULL, -- WhatsApp / Email
    kategori VARCHAR(100) DEFAULT 'Umum',
    pesan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'baru', -- baru, dibalas, diarsipkan
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk Kontak
ALTER TABLE public.kontak_inbox ENABLE ROW LEVEL SECURITY;

-- Publik diizinkan mengirim pesan (INSERT)
CREATE POLICY "Publik dapat mengirim pesan kontak" 
ON public.kontak_inbox 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Hanya admin/pengurus yang dapat membaca pesan
CREATE POLICY "Hanya authenticated admin membaca inbox" 
ON public.kontak_inbox 
FOR SELECT 
TO authenticated 
USING (true);


-- 2. Tabel Kampanye Progres Wakaf Lahan
CREATE TABLE IF NOT EXISTS public.wakaf_lahan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL DEFAULT 'Pembebasan Lahan Sentra Dakwah & Masjid YIMI',
    lokasi TEXT NOT NULL,
    luas_target_m2 INTEGER NOT NULL DEFAULT 1200,
    harga_per_meter NUMERIC(15, 2) NOT NULL DEFAULT 1500000,
    target_dana NUMERIC(15, 2) NOT NULL DEFAULT 1800000000,
    terkumpul NUMERIC(15, 2) NOT NULL DEFAULT 774000000,
    diperbarui_pada DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.wakaf_lahan ENABLE ROW LEVEL SECURITY;

-- Publik dapat membaca data progres kampanye
CREATE POLICY "Publik dapat membaca progres wakaf" 
ON public.wakaf_lahan 
FOR SELECT 
TO anon, authenticated 
USING (true);


-- 3. Tabel Jadwal Kajian Ilmiah
CREATE TABLE IF NOT EXISTS public.jadwal_kajian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hari VARCHAR(50) NOT NULL,
    tanggal DATE NOT NULL,
    waktu VARCHAR(100) NOT NULL,
    tema VARCHAR(255) NOT NULL,
    pemateri VARCHAR(255) NOT NULL,
    tempat VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) DEFAULT 'Rutin Pekanan',
    sifat VARCHAR(100) DEFAULT 'Terbuka untuk Umum (Ikhwan & Akhwat)',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jadwal_kajian ENABLE ROW LEVEL SECURITY;

-- Publik dapat membaca jadwal kajian yang aktif
CREATE POLICY "Publik dapat membaca jadwal kajian" 
ON public.jadwal_kajian 
FOR SELECT 
TO anon, authenticated 
USING (is_active = true);


-- 4. Tabel Konfirmasi Donasi Masuk
CREATE TABLE IF NOT EXISTS public.donasi_konfirmasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_donatur VARCHAR(255) NOT NULL,
    nomor_whatsapp VARCHAR(50) NOT NULL,
    program VARCHAR(100) NOT NULL, -- Wakaf Lahan, Jumat Berkah, Operasional Dakwah
    nominal NUMERIC(15, 2) NOT NULL,
    bank_tujuan VARCHAR(100) NOT NULL DEFAULT 'BSI',
    tanggal_transfer DATE NOT NULL,
    bukti_transfer_url TEXT,
    catatan TEXT,
    status_verifikasi VARCHAR(50) DEFAULT 'menunggu', -- menunggu, terverifikasi, ditolak
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.donasi_konfirmasi ENABLE ROW LEVEL SECURITY;

-- Publik dapat mengirim konfirmasi donasi
CREATE POLICY "Publik dapat submit konfirmasi donasi" 
ON public.donasi_konfirmasi 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
