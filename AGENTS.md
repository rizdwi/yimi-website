# AGENTS.md — Panduan untuk Agen AI pada Proyek Website YIMI

File ini dibaca oleh agen AI (Claude Code, Cursor, Copilot, dan sejenisnya) sebelum mengubah kode. Ikuti aturan di sini. Jika ada yang bertentangan dengan permintaan pengguna, tanyakan dulu.

Dokumen pendamping:
- `PRD.md` — kebutuhan produk, sitemap, dan kriteria penerimaan
- `design.md` — warna, tipografi, komponen, dan animasi

---

## 1. Gambaran Proyek

- **Nama:** Website Yayasan Insan Muslim Istiqomah (YIMI)
- **Tujuan:** Website profil, program, dan penggalangan dana untuk yayasan dakwah.
- **Bahasa konten:** Bahasa Indonesia (`lang="id"`). Teks Arab memakai `dir="rtl"`.
- **Stack yang direkomendasikan:** Next.js (App Router) + TypeScript + Tailwind CSS + GSAP (ScrollTrigger). Jika stack berbeda, sebutkan di awal pekerjaan.

> Jika `package.json` sudah ada, ikuti stack yang ada dan jangan migrasi tanpa izin.

---

## 2. Perintah Dasar

```bash
pnpm install          # pasang dependensi
pnpm dev              # jalankan di http://localhost:3000
pnpm build            # build produksi, wajib lolos sebelum commit
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # unit test (jika ada)
```

Sebelum menyatakan pekerjaan selesai, jalankan `pnpm lint`, `pnpm typecheck`, dan `pnpm build`. Laporkan hasilnya.

---

## 3. Struktur Folder (target)

```
yimi-website/
├── app/
│   ├── layout.tsx            # font, metadata global, navbar, footer
│   ├── page.tsx              # beranda
│   ├── tentang/page.tsx
│   ├── program/
│   │   ├── page.tsx
│   │   ├── tk-paud/page.tsx
│   │   ├── jumat-berkah/page.tsx
│   │   └── kajian/page.tsx
│   ├── pembebasan-lahan/page.tsx
│   ├── berita/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── galeri/page.tsx
│   ├── donasi/page.tsx
│   ├── kontak/page.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── layout/               # Navbar, Footer, MobileMenu
│   ├── sections/             # Hero, ProgramCards, LandBanner, KajianSchedule, dll.
│   ├── ui/                   # Button, Card, Badge, ProgressBar (atomic)
│   └── motion/               # ParallaxLayer, FadeUp, CountUp
├── content/                  # SUMBER KONTEN (markdown/json)
│   ├── site.json             # nama, kontak, rekening, sosial media
│   ├── about.md              # visi, misi, manhaj, sejarah
│   ├── programs/*.md
│   ├── land-campaign.json    # target, terkumpul, lokasi
│   ├── kajian.json           # jadwal kajian
│   ├── gallery.json
│   └── news/*.md
├── lib/                      # helper: formatRupiah, slugify, ics, seo
├── styles/                   # globals.css, token warna
├── public/
│   ├── logo/                 # logo-yimi.(svg|png|jpeg)
│   ├── patterns/             # pattern-star8.svg
│   └── images/
└── AGENTS.md
```

Konten yang sering berubah **harus** berada di folder `content/`, bukan di-hardcode di komponen.

---

## 4. Aturan Utama

### 4.1 Konten & Isi Keagamaan

1. **Jangan mengarang teks keagamaan.** Visi, misi, manhaj, ayat, hadits, dan fatwa hanya boleh diambil dari teks yang diberikan pengurus. Jika belum ada, pakai placeholder `TBD` yang mencolok, misalnya `[TBD: visi resmi]`, dan beri tahu pengguna.
2. **Pastikan kutipan benar.** Setiap ayat atau hadits harus menyebut sumber (surat dan nomor ayat, atau nama kitab dan nomor hadits). Jika sumber tidak jelas, jangan dipakai.
3. **Jangan menambahkan klaim yang tidak bisa dibuktikan**, misalnya jumlah jamaah, jumlah donasi terkumpul, atau nama donatur, kecuali tertulis di `content/`.
4. **Bahasa:** gunakan istilah yang biasa dipakai di lingkungan yayasan (dakwah, kajian, pekanan, infaq, wakaf, Salafus Shalih). Hindari sebutan yang merendahkan kelompok lain.
5. Tidak ada teks yang menghina atau memprovokasi terhadap individu, golongan, atau agama lain.

### 4.2 Privasi

- Foto anak-anak (TK/PAUD) hanya dipakai jika ada flag `izinOrangTua: true` di metadata gambar. Jika tidak ada, jangan tampilkan foto tersebut.
- Jangan menyimpan atau menampilkan data pribadi pengunjung (nama, nomor HP) di log, analytics, atau kode sumber.
- Data form kontak dikirim ke endpoint server, bukan langsung ke pihak ketiga tanpa persetujuan.
- Nomor rekening dan QRIS hanya diambil dari `content/site.json`.

### 4.3 Donasi

- Dalam v1, donasi berupa **transfer manual dan QRIS statis**. Jangan menambahkan payment gateway tanpa instruksi tertulis.
- Angka progres pembebasan lahan (`terkumpul`) diubah lewat `content/land-campaign.json`, **bukan** dihitung otomatis.
- Setiap tampilan nominal memakai format Rupiah (`Rp 1.250.000`) lewat helper `formatRupiah`.
- Tombol "Konfirmasi via WhatsApp" menggunakan pesan terisi otomatis, dengan nomor dari `site.json`.

### 4.4 Desain & Animasi

- Ikuti `design.md` untuk warna, font, spacing, dan komponen. Jangan menambah warna baru tanpa token.
- Gunakan token CSS / Tailwind theme: `yimi-blue-600`, `yimi-green-500`, dst. Jangan menulis hex langsung di komponen.
- **Parallax wajib** mengikuti spesifikasi di `design.md` bagian 7, termasuk fallback mobile dan `prefers-reduced-motion`.
- Animasi hanya memakai `transform` dan `opacity`.
- Logo tidak boleh diubah warnanya, diputar, diberi bayangan, atau distorsi rasio.
- Kuning `#FFF200` tidak boleh dipakai sebagai latar dengan teks putih.

### 4.5 Aksesibilitas & SEO

- Setiap halaman memiliki satu `h1`, metadata `title` dan `description` unik, dan Open Graph.
- Semua `<img>` memiliki `alt`. Dekoratif memakai `alt=""` dan `aria-hidden="true"`.
- Navigasi bisa dipakai dengan keyboard.
- Gambar memakai `next/image` (atau setara) dengan ukuran eksplisit.
- Jangan menghapus `lang="id"` di root layout.

### 4.6 Performa

- Hindari library UI berat. Utamakan Tailwind dan komponen sendiri.
- Gunakan dynamic import untuk komponen berat (peta, lightbox, GSAP di section bawah).
- Target: LCP < 2,5 detik di mobile; bundle halaman beranda < 180 KB (gzip, tanpa gambar).

---

## 5. Pekerjaan yang Boleh dan Tidak Boleh

### Boleh tanpa bertanya
- Memperbaiki bug yang jelas dan menambahkan test untuknya
- Merapikan komponen, menambah komentar, memperbaiki typo bahasa Indonesia
- Membuat komponen baru sesuai `design.md`
- Menambah halaman baru yang ada di sitemap `PRD.md`
- Menambahkan `TBD` untuk konten yang belum tersedia

### Harus bertanya dulu
- Mengganti stack atau framework
- Menambah dependensi besar (> 50 KB gzip)
- Menambah payment gateway atau layanan pihak ketiga yang memproses data
- Mengubah visi, misi, manhaj, atau teks keagamaan apa pun
- Menampilkan foto orang (terutama anak-anak) yang belum ada izinnya
- Menghapus halaman atau fitur dari PRD
- Deploy ke production

### Dilarang
- Menulis atau menyalin hadits/ayat tanpa sumber
- Menyimpan kunci API, password, atau rekening di kode sumber (gunakan `.env`)
- Menghapus atau mengubah file `PRD.md`, `design.md`, atau `AGENTS.md` tanpa instruksi
- Menggunakan `localStorage` untuk data penting (data donatur, form)
- Menambahkan iklan, pop-up donasi otomatis, atau pelacak pihak ketiga tanpa persetujuan

---

## 6. Gaya Kode

- TypeScript strict. Hindari `any`.
- Komponen fungsional dengan named export. Satu komponen per file.
- Nama file: `kebab-case` untuk file, `PascalCase` untuk komponen.
- Props didefinisikan dengan `type`, bukan `interface`, kecuali perlu extends.
- Konten dibaca lewat fungsi di `lib/content.ts`, bukan `fs` langsung di komponen.
- Komentar dalam Bahasa Indonesia atau Inggris, konsisten dalam satu file.
- Commit message dalam Bahasa Indonesia atau Inggris, format: `feat:`, `fix:`, `style:`, `content:`, `docs:`.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
Read docs if needed. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
