# Design Spec — Website YIMI

Dokumen ini menjelaskan arah visual, sistem warna, tipografi, komponen, dan pola animasi. Sumber utama: logo YIMI.

---

## 1. Arah Visual

**Kata kunci:** bersih · teduh · berwibawa · hangat · modern tapi tidak ramai

Logo YIMI memakai bentuk bintang 8 sudut (geometri Islami), kubah masjid dengan bulan sabit, dan Al-Qur'an terbuka di atas dua telapak tangan. Desain website mengambil **bentuk geometri dan warna** dari logo, lalu menjaga layout tetap lapang dan minimalis agar terasa profesional.

**Prinsip:**
1. **Clean dulu, warna sebagai aksen.** Latar putih/krem dominan. Kuning, hijau, dan biru dipakai sebagai aksen, bukan seluruh permukaan.
2. **Geometri sebagai motif.** Pola bintang 8 sudut dipakai sangat tipis di latar section (opacity 4–8%) dan sebagai elemen dekoratif parallax.
3. **Tidak ramai.** Maksimal dua warna aksen dalam satu section.
4. **Teks terbaca.** Hindari teks merah di atas kuning atau hijau; gunakan biru gelap untuk teks di atas latar terang.

---

## 2. Warna

| Token | Hex | Sumber di logo | Pemakaian |
|---|---|---|---|
| `--yimi-blue-600` | `#3E5FD1` | Biru royal (bintang luar, kubah, tangan) | Warna utama: tombol primer, navbar, judul section |
| `--yimi-blue-800` | `#1F2F6B` | Turunan biru gelap | Footer, teks utama pada latar terang |
| `--yimi-blue-50` | `#EEF2FC` | Turunan biru terang | Latar kartu, section alternatif |
| `--yimi-green-500` | `#2EE05A` | Hijau cerah (garis tengah bintang) | Aksen: ikon, badge, indikator progres |
| `--yimi-green-700` | `#138A3A` | Turunan hijau (untuk teks) | Teks/tautan hijau di latar terang (kontras WCAG AA) |
| `--yimi-yellow-400` | `#FFF200` | Kuning (latar tengah logo) | Highlight kecil, bar progres, sorotan CTA sekunder |
| `--yimi-red-600` | `#D7261E` | Teks "YAYASAN INSAN..." | Hanya untuk penekanan kecil (tanggal penting, label "Donasi") |
| `--neutral-900` | `#111827` | — | Teks isi |
| `--neutral-500` | `#6B7280` | — | Teks sekunder |
| `--neutral-100` | `#F5F7FA` | — | Latar halaman |
| `--white` | `#FFFFFF` | Latar logo | Latar kartu dan section utama |

**Aturan kontras:**
- Kuning `#FFF200` **tidak dipakai** sebagai latar bertekstur dengan teks putih. Jika kuning dipakai sebagai latar, teks harus biru gelap.
- Teks merah `#D7261E` **tidak dipakai** untuk paragraf panjang. Maksimal untuk judul pendek atau label.
- Pasangan teks/latar yang diuji harus mencapai rasio minimal 4.5:1 (teks isi) dan 3:1 (teks besar).
