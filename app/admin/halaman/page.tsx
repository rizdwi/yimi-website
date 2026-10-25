'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Building,
  Home,
  MapPin,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
  BookOpen,
  Users,
  FileText,
  Compass,
} from 'lucide-react';
import { QuoteEditor, QuoteData } from '@/components/admin/QuoteEditor';

interface PengurusItem {
  jabatan: string;
  nama: string;
  peran: string;
}

interface MaknaItem {
  elemen: string;
  makna: string;
}

export default function AdminHalamanPage() {
  const [activeTab, setActiveTab] = useState<'tentang' | 'beranda' | 'kontak' | 'preview'>('tentang');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- STATE HALAMAN TENTANG ---
  const [visi, setVisi] = useState(
    'Menjadi lembaga dakwah, pendidikan, dan sosial Islam yang istiqomah di atas manhaj Salafus Shalih, amanah, profesional, dan menebarkan manfaat bagi umat.'
  );
  const [misiList, setMisiList] = useState<string[]>([
    'Menyelenggarakan kajian Islam ilmiah berlandaskan Al-Qur\'an dan As-Sunnah sesuai pemahaman Salafus Shalih.',
    'Mengembangkan pendidikan anak usia dini (TK) yang berakhlak mulia, beraqidah shahihah, dan cinta Al-Qur\'an.',
    'Menyalurkan kepedulian sosial kaum muslimin melalui program rutin seperti Jumat Berkah dan bantuan kemanusiaan.',
    'Mewujudkan sarana ibadah dan pusat dakwah permanen melalui pembebasan lahan wakaf yang berkelanjutan.',
  ]);
  const [manhajJudul, setManhajJudul] = useState('Landasan Dakwah & Manhaj Salafus Shalih');
  const [manhajPenjelasan, setManhajPenjelasan] = useState(
    'Dakwah YIMI ditegakkan di atas sunnah Rasulullah ﷺ, berlandaskan Al-Qur\'an dan As-Sunnah dengan merujuk kepada pemahaman Salafus Shalih (para sahabat radhiyallahu \'anhum, tabi\'in, dan tabi\'ut tabi\'in). Kami menjunjung tinggi prinsip keikhlasan, ittiba\' (mengikuti dalil), dan dakwah bil hikmah.'
  );
  const [dalilQuran, setDalilQuran] = useState<QuoteData>({
    teksArab: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ',
    terjemahan:
      'Wahai orang-orang yang beriman! Bertakwalah kepada Allah sebenar-benar takwa kepada-Nya dan janganlah kamu mati kecuali dalam keadaan muslim.',
    sumber: 'QS. Ali \'Imran [3]: 102',
    tipe: 'ayat',
  });
  const [dalilHadits, setDalilHadits] = useState<QuoteData>({
    teksArab: 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ',
    terjemahan:
      'Aku telah tinggalkan pada kalian dua perkara yang kalian tidak akan tersesat selama berpegang teguh kepada keduanya: Kitabullah dan Sunnah Nabi-Nya.',
    sumber: 'HR. Malik dalam Al-Muwaththa\' No. 1594',
    tipe: 'hadits',
  });
  const [sejarahTeks, setSejarahTeks] = useState(
    'Yayasan Insan Muslim Istiqomah (YIMI) berawal dari majelis taklim kajian sunnah dan kepedulian bersama akan pentingnya sarana pendidikan Islam generasi dini di Kota Depok pada tahun 2023. Seiring berjalannya waktu, amanah umat berkembang hingga diresmikan secara legal formal melalui SK Kemenkumham RI Nomor AHU-0012345.AH.01.04.Tahun 2023.'
  );
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([
    {
      jabatan: 'Dewan Pembina',
      nama: 'Ustadz Pembina YIMI',
      peran: 'Memberikan arahan strategis, pembinaan syariah, dan penjagaan manhaj yayasan.',
    },
    {
      jabatan: 'Ketua Pengurus',
      nama: 'Rizz (Ketua Yayasan)',
      peran: 'Memimpin eksekusi program harian, koordinasi divisi, dan hubungan eksternal.',
    },
    {
      jabatan: 'Sekretaris',
      nama: 'Sekretaris YIMI',
      peran: 'Administrasi, korespondensi resmi, perizinan, dan tata kelola dokumentasi.',
    },
    {
      jabatan: 'Bendahara',
      nama: 'Bendahara YIMI',
      peran: 'Akuntabilitas keuangan, pelaporan donasi, dan pengelolaan kas operasional yayasan.',
    },
  ]);
  const [maknaLambang, setMaknaLambang] = useState<MaknaItem[]>([
    {
      elemen: 'Bintang 8 Sudut (Khatim / Rub el Hizb)',
      makna: 'Bentuk geometri Islam melambangkan ketertiban syariat, keindahan arsitektur peradaban Islam, dan komitmen untuk istiqomah meniti sunnah.',
    },
    {
      elemen: 'Kubah Masjid & Bulan Sabit (Hilal)',
      makna: 'Simbol pusat tauhid dan ibadah umat, sekaligus penegasan arah dakwah untuk memakmurkan rumah Allah dan memancarkan syiar cahaya Islam.',
    },
    {
      elemen: "Al-Qur'an Terbuka",
      makna: "Menjadi sumber rujukan utama seluruh lini gerak yayasan, lambang ilmu syar'i yang diamalkan dan diajarkan kepada generasi ke generasi.",
    },
    {
      elemen: 'Dua Telapak Tangan',
      makna: 'Melambangkan doa, tawakal, keikhlasan dalam berkhidmah, serta amanah dalam memegang dan menyalurkan infaq para muhsinin.',
    },
  ]);

  // --- STATE HALAMAN BERANDA ---
  // Tagline: satu per baris di textarea, tampil bergantian tiap 5 detik di hero
  const [heroTaglinesText, setHeroTaglinesText] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  // --- STATE HALAMAN KONTAK ---
  const [alamatKantor, setAlamatKantor] = useState('');
  const [jamOperasional, setJamOperasional] = useState('Setiap Hari: 08.00 - 17.00 WIB');
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('');

  useEffect(() => {
    async function loadStaticPages() {
      try {
        const res = await fetch('/api/admin/static-pages');
        if (res.ok) {
          const data = await res.json();
          const pages = data.pages || [];

          // Load data tentang
          const tentangPage = pages.find((p: { kunci: string }) => p.kunci === 'tentang');
          if (tentangPage?.konten) {
            const c = tentangPage.konten;
            if (c.visi !== undefined) setVisi(c.visi);
            if (Array.isArray(c.misi)) setMisiList(c.misi);
            if (c.manhaj?.judul !== undefined) setManhajJudul(c.manhaj.judul);
            if (c.manhaj?.penjelasan !== undefined) setManhajPenjelasan(c.manhaj.penjelasan);
            if (c.manhaj?.dalilQuran !== undefined) setDalilQuran(c.manhaj.dalilQuran);
            if (c.manhaj?.dalilHadits !== undefined) setDalilHadits(c.manhaj.dalilHadits);
            if (c.sejarah?.teks !== undefined) setSejarahTeks(c.sejarah.teks);
            if (Array.isArray(c.strukturPengurus)) setPengurusList(c.strukturPengurus);
            if (Array.isArray(c.maknaLambang)) setMaknaLambang(c.maknaLambang);
          }

          // Load data beranda
          const berandaPage = pages.find((p: { kunci: string }) => p.kunci === 'beranda');
          if (berandaPage?.konten) {
            const c = berandaPage.konten;
            if (Array.isArray(c.heroTaglines)) {
              setHeroTaglinesText(c.heroTaglines.join('\n'));
            } else if (typeof c.heroTagline === 'string') {
              setHeroTaglinesText(c.heroTagline);
            } else {
              setHeroTaglinesText('');
            }
            if (typeof c.heroSubtitle === 'string') {
              setHeroSubtitle(c.heroSubtitle);
            } else {
              setHeroSubtitle('');
            }
          }

          // Load data kontak
          const kontakPage = pages.find((p: { kunci: string }) => p.kunci === 'kontak');
          if (kontakPage?.konten) {
            const c = kontakPage.konten;
            if (c.alamat !== undefined) setAlamatKantor(c.alamat);
            if (c.jamOperasional !== undefined) setJamOperasional(c.jamOperasional);
            if (c.mapsEmbed !== undefined) setMapsEmbedUrl(c.mapsEmbed);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStaticPages();
  }, []);

  async function handleSaveAll() {
    setMessage(null);

    // Validasi dalil
    if (!dalilQuran.sumber.trim() || !dalilHadits.sumber.trim()) {
      setMessage({
        type: 'error',
        text: 'Setiap kutipan Al-Qur\'an dan Hadits wajib menyertakan sumber rujukan shahih!',
      });
      return;
    }

    setSaving(true);

    try {
      // 1. Simpan Konten Halaman Tentang
      const resTentang = await fetch('/api/admin/static-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kunci: 'tentang',
          judul: 'Tentang Yayasan & Manhaj Dakwah',
          konten: {
            visi,
            misi: misiList,
            manhaj: {
              judul: manhajJudul,
              penjelasan: manhajPenjelasan,
              dalilQuran,
              dalilHadits,
            },
            sejarah: {
              teks: sejarahTeks,
            },
            strukturPengurus: pengurusList,
            maknaLambang,
          },
          status: 'terbit',
        }),
      });

      // 2. Simpan Konten Halaman Beranda
      const taglineList = heroTaglinesText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);
      const resBeranda = await fetch('/api/admin/static-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kunci: 'beranda',
          judul: 'Pengantar Beranda & Tagline',
          konten: {
            heroTaglines: taglineList,
            heroTagline: taglineList[0] || '',
            heroSubtitle,
          },
          status: 'terbit',
        }),
      });

      // 3. Simpan Konten Halaman Kontak
      const resKontak = await fetch('/api/admin/static-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kunci: 'kontak',
          judul: 'Informasi Kontak & Lokasi',
          konten: {
            alamat: alamatKantor,
            jamOperasional,
            mapsEmbed: mapsEmbedUrl,
          },
          status: 'terbit',
        }),
      });

      if (resTentang.ok && resBeranda.ok && resKontak.ok) {
        setMessage({
          type: 'success',
          text: 'Seluruh konten halaman statis (Tentang, Beranda, Kontak) berhasil disimpan dan terbit!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Gagal menyimpan beberapa bagian halaman. Silakan periksa koneksi.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi gangguan jaringan saat menyimpan data.' });
    } finally {
      setSaving(false);
    }
  }

  // Helper untuk edit misi
  function handleAddMisi() {
    setMisiList([...misiList, '']);
  }
  function handleRemoveMisi(idx: number) {
    setMisiList(misiList.filter((_, i) => i !== idx));
  }
  function handleMisiChange(idx: number, val: string) {
    const updated = [...misiList];
    updated[idx] = val;
    setMisiList(updated);
  }

  // Helper untuk edit pengurus
  function handleAddPengurus() {
    setPengurusList([...pengurusList, { jabatan: '', nama: '', peran: '' }]);
  }
  function handleRemovePengurus(idx: number) {
    setPengurusList(pengurusList.filter((_, i) => i !== idx));
  }
  function handlePengurusChange(idx: number, field: keyof PengurusItem, val: string) {
    const updated = [...pengurusList];
    updated[idx] = { ...updated[idx], [field]: val };
    setPengurusList(updated);
  }

  // Helper untuk edit filosofi makna lambang yayasan
  function handleAddMakna() {
    setMaknaLambang([...maknaLambang, { elemen: '', makna: '' }]);
  }
  function handleRemoveMakna(idx: number) {
    setMaknaLambang(maknaLambang.filter((_, i) => i !== idx));
  }
  function handleMaknaChange(idx: number, field: keyof MaknaItem, val: string) {
    const updated = [...maknaLambang];
    updated[idx] = { ...updated[idx], [field]: val };
    setMaknaLambang(updated);
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#3E5FD1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#6B7280]">Memuat editor halaman statis…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Utama & Tombol Simpan */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">
            Pengelola Halaman Statis &amp; Profil Lengkap
          </h2>
          <p className="text-xs text-[#6B7280]">
            Satu paket terpadu untuk mengelola seluruh teks Beranda, profil Tentang Yayasan, manhaj dakwah, dan kontak.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Menyimpan Semua…' : 'Simpan Seluruh Halaman'}</span>
        </button>
      </div>

      {/* Pesan Notifikasi Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
              : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#138A3A]" />
          ) : null}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Navigasi Halaman */}
      <div className="flex border-b border-[#E3E7EE] gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tentang')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tentang'
              ? 'border-[#3E5FD1] text-[#3E5FD1]'
              : 'border-transparent text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Halaman Tentang Kami (/tentang)</span>
        </button>

        <button
          onClick={() => setActiveTab('beranda')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'beranda'
              ? 'border-[#3E5FD1] text-[#3E5FD1]'
              : 'border-transparent text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Halaman Beranda (Headline &amp; Hero)</span>
        </button>

        <button
          onClick={() => setActiveTab('kontak')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'kontak'
              ? 'border-[#3E5FD1] text-[#3E5FD1]'
              : 'border-transparent text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Kontak &amp; Alamat (/kontak)</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-4 flex items-center space-x-2 border-b-2 transition whitespace-nowrap ml-auto ${
            activeTab === 'preview'
              ? 'border-[#2EE05A] text-[#138A3A]'
              : 'border-transparent text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Pratinjau Tampilan Profil</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HALAMAN TENTANG KAMI                              */}
      {/* ======================================================== */}
      {activeTab === 'tentang' && (
        <div className="space-y-6">
          {/* Visi & Misi */}
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <ShieldCheck className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">Visi &amp; Misi Yayasan</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Visi Utama Lembaga <span className="text-[#D7261E]">*</span>
              </label>
              <textarea
                rows={2}
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#374151]">
                  Daftar Misi Yayasan (Poin-poin langkah konkret)
                </label>
                <button
                  type="button"
                  onClick={handleAddMisi}
                  className="inline-flex items-center space-x-1 text-xs text-[#3E5FD1] hover:underline font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Poin Misi</span>
                </button>
              </div>

              <div className="space-y-2">
                {misiList.map((m, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-6 text-center text-xs font-bold text-[#6B7280]">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => handleMisiChange(idx, e.target.value)}
                      placeholder="Tuliskan misi konkret yayasan..."
                      className="flex-1 text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMisi(idx)}
                      className="p-2 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg transition"
                      title="Hapus Misi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manhaj & Dalil Syar'i */}
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <BookOpen className="w-5 h-5 text-[#3E5FD1]" />
              <div>
                <h3 className="font-bold text-base text-[#111827]">
                  Landasan Manhaj &amp; Dalil Rujukan Shahih
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Sesuai AGENTS.md 4.1: Kutipan ayat/hadits wajib menyertakan rujukan surat/kitab dan tidak mengarang teks keagamaan.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Judul Bagian Manhaj
              </label>
              <input
                type="text"
                value={manhajJudul}
                onChange={(e) => setManhajJudul(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Penjelasan Prinsip Manhaj Salafus Shalih
              </label>
              <textarea
                rows={3}
                value={manhajPenjelasan}
                onChange={(e) => setManhajPenjelasan(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            {/* Dalil 1: Al-Qur'an */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#1F2F6B] block mb-2">
                1. Dalil Al-Qur&apos;anul Karim (Wajib Ber-Sumber)
              </span>
              <QuoteEditor value={dalilQuran} onChange={setDalilQuran} required={true} />
            </div>

            {/* Dalil 2: Hadits */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#1F2F6B] block mb-2">
                2. Dalil As-Sunnah / Hadits Nabi ﷺ (Wajib Ber-Sumber)
              </span>
              <QuoteEditor value={dalilHadits} onChange={setDalilHadits} required={true} />
            </div>
          </div>

          {/* Sejarah Lembaga */}
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <FileText className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">Sejarah &amp; Latar Belakang Yayasan</h3>
            </div>

            <div>
              <textarea
                rows={4}
                value={sejarahTeks}
                onChange={(e) => setSejarahTeks(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg leading-relaxed"
              />
            </div>
          </div>

          {/* Susunan Dewan Pengurus */}
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#3E5FD1]" />
                <h3 className="font-bold text-base text-[#111827]">
                  Susunan Dewan Pembina &amp; Pengurus Yayasan
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddPengurus}
                className="inline-flex items-center space-x-1 text-xs text-[#3E5FD1] hover:underline font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengurus</span>
              </button>
            </div>

            <div className="space-y-3">
              {pengurusList.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold block mb-0.5">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={p.jabatan}
                      onChange={(e) => handlePengurusChange(idx, 'jabatan', e.target.value)}
                      placeholder="Ketua / Pembina..."
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold block mb-0.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={p.nama}
                      onChange={(e) => handlePengurusChange(idx, 'nama', e.target.value)}
                      placeholder="Nama & Gelar..."
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold block mb-0.5">
                      Tugas / Peran
                    </label>
                    <input
                      type="text"
                      value={p.peran}
                      onChange={(e) => handlePengurusChange(idx, 'peran', e.target.value)}
                      placeholder="Deskripsi tugas singkat..."
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemovePengurus(idx)}
                      className="p-2 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filosofi & Makna Lambang Yayasan */}
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#3E5FD1]" />
                <h3 className="font-bold text-base text-[#111827]">
                  Filosofi &amp; Makna Lambang Yayasan
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddMakna}
                className="inline-flex items-center space-x-1 text-xs text-[#3E5FD1] hover:underline font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Elemen Lambang</span>
              </button>
            </div>

            <div className="space-y-3">
              {maknaLambang.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold block mb-0.5">
                      Elemen Simbol / Lambang
                    </label>
                    <input
                      type="text"
                      value={m.elemen}
                      onChange={(e) => handleMaknaChange(idx, 'elemen', e.target.value)}
                      placeholder="Nama elemen lambang..."
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <label className="text-[10px] text-[#6B7280] uppercase font-bold block mb-0.5">
                      Arti &amp; Makna Filosofis
                    </label>
                    <textarea
                      rows={2}
                      value={m.makna}
                      onChange={(e) => handleMaknaChange(idx, 'makna', e.target.value)}
                      placeholder="Penjelasan makna filosofis..."
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveMakna(idx)}
                      className="p-2 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: HALAMAN BERANDA (HOME)                            */}
      {/* ======================================================== */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <Home className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">Headline &amp; Hero Beranda</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Tagline Beranda — satu per baris, tampil bergantian tiap 5 detik
              </label>
              <textarea
                rows={3}
                value={heroTaglinesText}
                onChange={(e) => setHeroTaglinesText(e.target.value)}
                placeholder={'Contoh:\nDakwah di Atas Sunnah Sesuai Pemahaman Salafus Shalih\nMenebar Sunnah, Merajut Ukhuwah, Membangun Generasi Rabbani'}
                className="w-full text-sm font-bold p-2.5 bg-white border border-[#E3E7EE] rounded-lg leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Subjudul Penjelasan Dakwah (Hero Subtitle)
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Contoh: Wadah dakwah ilmiah, pendidikan Islam usia dini berbasis tauhid & adab, serta kepedulian sosial umat di atas manhaj Salafus Shalih."
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KONTAK & ALAMAT                                    */}
      {/* ======================================================== */}
      {activeTab === 'kontak' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <MapPin className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">Lokasi Sekretariat &amp; Jam Layanan</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Alamat Lengkap Kantor / Sekretariat
              </label>
              <textarea
                rows={2}
                value={alamatKantor}
                onChange={(e) => setAlamatKantor(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Jam Layanan Operasional
              </label>
              <input
                type="text"
                value={jamOperasional}
                onChange={(e) => setJamOperasional(e.target.value)}
                placeholder="Setiap Hari: 08.00 - 17.00 WIB"
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                URL Google Maps Embed (iframe source)
              </label>
              <input
                type="text"
                value={mapsEmbedUrl}
                onChange={(e) => setMapsEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PRATINJAU LANGSUNG (LIVE PREVIEW)                 */}
      {/* ======================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-6 bg-[#F5F7FA] p-6 rounded-2xl border border-[#E3E7EE]">
          <div className="text-center pb-4 border-b border-[#E3E7EE]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3E5FD1] bg-[#EEF2FC] px-3 py-1 rounded-full">
              Pratinjau Halaman Profil Publik
            </span>
            <h3 className="text-2xl font-bold text-[#1F2F6B] mt-2">
              Tentang Yayasan Insan Muslim Istiqomah
            </h3>
          </div>

          {/* Visi Misi Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EEF2FC]/70 p-5 rounded-2xl border border-[#3E5FD1]/20">
              <span className="text-[10px] font-bold text-[#3E5FD1] uppercase tracking-wider block mb-1">
                Visi Yayasan
              </span>
              <p className="text-sm font-semibold text-[#1F2F6B] italic leading-relaxed">
                &ldquo;{visi}&rdquo;
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE]">
              <span className="text-[10px] font-bold text-[#138A3A] uppercase tracking-wider block mb-1">
                Misi Yayasan
              </span>
              <ul className="text-xs text-[#374151] space-y-1.5 list-disc pl-4">
                {misiList.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dalil Manhaj Preview */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E7EE] space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#1F2F6B]">{manhajJudul}</h4>
              <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">{manhajPenjelasan}</p>
            </div>

            <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-1 text-center">
              <p
                className="font-serif text-lg text-[#1F2F6B] leading-loose font-bold"
                dir="rtl"
                lang="ar"
              >
                {dalilQuran.teksArab}
              </p>
              <p className="text-xs text-[#4B5563] italic">&ldquo;{dalilQuran.terjemahan}&rdquo;</p>
              <span className="text-[11px] font-semibold text-[#3E5FD1] block font-mono">
                — {dalilQuran.sumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tombol Simpan Footer */}
      <div className="flex justify-end pt-4 border-t border-[#E3E7EE]">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-3 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-60"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Menyimpan Perubahan…' : 'Simpan Seluruh Konten Halaman'}</span>
        </button>
      </div>
    </div>
  );
}
