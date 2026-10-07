# PRD — Website Yayasan Insan Muslim Istiqomah (YIMI)

| Item | Keterangan |
|---|---|
| Nama proyek | Website YIMI |
| Versi dokumen | 0.1 (draft awal) |
| Status | Draft untuk review |
| Pemilik | Pengurus YIMI |
| Referensi tampilan | istiqomah.sch.id (struktur & alur informasi) |

---

## 1. Ringkasan

YIMI adalah yayasan dakwah yang bertujuan mengajak kaum muslimin kepada Islam yang murni. Dakwah ditegakkan di atas sunnah, berlandaskan Al-Qur'an dan Hadits, sesuai pemahaman Salafus Shalih.

Website ini berfungsi sebagai:

1. **Etalase identitas** — memperkenalkan visi, misi, dan manhaj yayasan secara jelas.
2. **Pusat informasi program** — TK/PAUD, Jumat Berkah, kajian pekanan, dan program lain.
3. **Media ajakan berinfaq** — kampanye pembebasan lahan dan sarana donasi.
4. **Kanal komunikasi** — jadwal kegiatan, berita, galeri, dan kontak.

## 2. Tujuan

| No | Tujuan | Indikator keberhasilan (contoh, sesuaikan) |
|---|---|---|
| T1 | Memperjelas visi, misi, dan manhaj yayasan | Pengunjung memahami profil yayasan dalam 1 halaman |
| T2 | Memudahkan calon jamaah/orang tua menemukan jadwal kajian dan program | Jadwal kajian dapat ditemukan dalam ≤ 2 klik dari beranda |
| T3 | Menggalang dukungan untuk pembebasan lahan dan program sosial | Tombol donasi terlihat di setiap halaman |
| T4 | Memberi kesan profesional dan modern | Skor Lighthouse Performance ≥ 85 di mobile |

## 3. Target Pengguna

- **Jamaah & simpatisan** — ingin tahu jadwal kajian, Jumat Berkah, dan cara berinfaq.
- **Orang tua calon murid TK/PAUD** — ingin tahu profil, kurikulum singkat, dan kontak pendaftaran.
- **Donatur** — ingin melihat progres dan tujuan pembebasan lahan, serta cara transfer yang jelas.
- **Pengurus & relawan** — memperbarui konten (kajian, berita, galeri).
- **Mesin pencari** — perlu metadata Indonesia yang baik agar mudah ditemukan.

Mayoritas pengguna mengakses melalui **ponsel**, sehingga desain mobile-first wajib.

## 4. Ruang Lingkup

### 4.1 In Scope (v1)

- Landing page satu halaman dengan beranda, profil, program, berita, galeri, donasi, dan kontak
- Efek **parallax scroll** pada section utama (hero, pembuka program, banner pembebasan lahan)
- Halaman program khusus untuk TK/PAUD, Jumat Berkah, dan Kajian Pekanan
- Halaman kampanye Pembebasan Lahan dengan progres donasi
- Halaman berita/artikel (daftar dan detail)
- Galeri foto kegiatan
- Form kontak (dan/atau tautan WhatsApp)
- Responsif (mobile, tablet, desktop)
- SEO dasar (metadata, sitemap, Open Graph)

### 4.2 Out of Scope (v1)

- Pembayaran donasi otomatis (payment gateway) — v1 cukup rekening bank dan QRIS statis
- Sistem pendaftaran murid online lengkap
- Akun jamaah / login publik
- Aplikasi mobile native
- Multi-bahasa (v1 hanya Bahasa Indonesia)

## 5. Struktur Informasi (Sitemap)

```
/                       Beranda (hero parallax, ringkasan semua section)
├── /tentang            Profil: visi, misi, manhaj, sejarah, struktur pengurus
├── /program
│   ├── /program/tk-paud        TK/PAUD
│   ├── /program/jumat-berkah   Jumat Berkah
│   └── /program/kajian         Kajian Pekanan (jadwal & pemateri)
├── /pembebasan-lahan   Kampanye pembebasan lahan + progres + cara berinfaq
├── /berita             Daftar artikel
│   └── /berita/[slug]  Detail artikel
├── /galeri             Galeri kegiatan
├── /donasi             Ringkasan cara donasi (rekening, QRIS, konfirmasi)
└── /kontak             Alamat, peta, WhatsApp, form kontak
```

Navigasi utama (navbar): Beranda · Tentang · Program · Pembebasan Lahan · Berita · Galeri · Kontak, dengan tombol **Donasi** yang menonjol.

## 6. Kebutuhan Fungsional

### 6.1 Beranda

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-HOME-01 | Hero section full-screen dengan logo, nama yayasan, dan tagline dakwah | Wajib |
| F-HOME-02 | Parallax scroll pada hero (lapisan latar bergerak lebih lambat dari teks) | Wajib |
| F-HOME-03 | Ayat/hadits pembuka yang dirotasi secara acak atau dipilih admin | Opsional |
| F-HOME-04 | Section ringkasan program (TK/PAUD, Jumat Berkah, Kajian) dengan kartu | Wajib |
| F-HOME-05 | Banner pembebasan lahan dengan parallax dan tombol "Ikut Berinfaq" | Wajib |
| F-HOME-06 | Tiga berita/artikel terbaru | Wajib |
| F-HOME-07 | Jadwal kajian pekanan terdekat | Wajib |
| F-HOME-08 | Ajakan kontak / WhatsApp di bagian bawah | Wajib |

### 6.2 Profil (/tentang)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-ABOUT-01 | Visi dan misi yayasan | Wajib |
| F-ABOUT-02 | Manhaj / landasan dakwah (Al-Qur'an, Sunnah, pemahaman Salafus Shalih) | Wajib |
| F-ABOUT-03 | Sejarah singkat yayasan | Wajib |
| F-ABOUT-04 | Struktur pengurus (nama, jabatan, foto opsional) | Wajib |
| F-ABOUT-05 | Logo dan makna lambang | Opsional |

### 6.3 Program

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-PROG-01 | Halaman TK/PAUD: deskripsi, kegiatan belajar, usia, info pendaftaran | Wajib |
| F-PROG-02 | Halaman Jumat Berkah: tujuan, mekanisme, cara ikut serta | Wajib |
| F-PROG-03 | Halaman Kajian Pekanan: hari, jam, tempat, tema, pemateri | Wajib |
| F-PROG-04 | Tombol "Tambahkan ke Kalender" (file .ics) untuk jadwal kajian | Opsional |
| F-PROG-05 | Program lain dapat ditambahkan tanpa mengubah struktur halaman | Wajib |

### 6.4 Pembebasan Lahan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-LAHAN-01 | Penjelasan tujuan pembebasan lahan (untuk apa, lokasi, luas target) | Wajib |
| F-LAHAN-02 | Progres penggalangan dana: target, terkumpul, persentase (bar animasi) | Wajib |
| F-LAHAN-03 | Informasi rekening bank dan QRIS, dengan tombol salin nomor rekening | Wajib |
| F-LAHAN-04 | Konfirmasi donasi via WhatsApp dengan pesan terisi otomatis | Wajib |
| F-LAHAN-05 | Galeri/dokumentasi progres lahan | Opsional |
| F-LAHAN-06 | Angka progres dikelola admin (bukan dihitung otomatis dari transaksi di v1) | Wajib |

### 6.5 Berita & Galeri

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-NEWS-01 | Daftar artikel dengan pagination atau tombol "muat lagi" | Wajib |
| F-NEWS-02 | Halaman detail artikel: judul, tanggal, penulis, isi, kategori | Wajib |
| F-NEWS-03 | Pencarian artikel sederhana berdasarkan judul | Opsional |
| F-GAL-01 | Galeri grid dengan lightbox | Wajib |
| F-GAL-02 | Kategori galeri (Kajian, Jumat Berkah, TK/PAUD, Pembebasan Lahan) | Opsional |

### 6.6 Kontak & Donasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-CONT-01 | Alamat lengkap, peta (embed Google Maps), jam operasional | Wajib |
| F-CONT-02 | Tombol WhatsApp langsung | Wajib |
| F-CONT-03 | Form kontak (nama, email/no. HP, pesan) dengan validasi dan proteksi spam | Wajib |
| F-DON-01 | Informasi rekening, QRIS, dan cara konfirmasi | Wajib |

### 6.7 Admin / Pengelolaan Konten

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-ADM-01 | Konten statis (visi, misi, program, pengurus) dapat diubah tanpa mengubah kode komponen | Wajib |
| F-ADM-02 | Berita, galeri, dan jadwal kajian dikelola lewat CMS sederhana (file JSON/Markdown di repo) | Wajib |

## 7. Kebutuhan Non-Fungsional

| Kategori | Target |
|---|---|
| Performa | LCP < 2,5 detik di 4G; total gambar hero dioptimasi |
| Responsif | Mobile-first; diuji di lebar 360px, 768px, 1280px |
| Aksesibilitas | Kontras teks memenuhi WCAG AA; navigasi keyboard; atribut alt pada semua gambar |
| Animasi | Parallax dinonaktifkan atau dikurangi jika pengguna mengaktifkan `prefers-reduced-motion` |
| SEO | Meta title & description per halaman; `lang="id"`; sitemap.xml; robots.txt; Open Graph |
| Keamanan | HTTPS; form terlindungi CSRF/spam (honeypot); tidak menyimpan data sensitif |
| Privasi | Foto anak-anak TK/PAUD hanya ditampilkan dengan izin orang tua tertulis |
| Ketersediaan | Target uptime 99% |
| Browser | Chrome, Safari, Edge, Firefox, Samsung Internet |

## 8. Spesifikasi Parallax

- Hero: latar (pola geometri/bintang 8 sudut dari logo) bergerak 0,3×; teks bergerak 0,6×; logo tetap stabil.
- Section Pembebasan Lahan: gambar latar bergerak 0,4× saat masuk viewport.
- Section Program: kartu muncul bertahap (fade-up) dengan jeda 100 ms antar kartu.
- Implementasi: GSAP ScrollTrigger atau CSS `transform` + `IntersectionObserver`.
- Fallback: di layar < 768px, parallax disederhanakan; nonaktif pada `prefers-reduced-motion`.
