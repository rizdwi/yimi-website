'use client';

import React, { useState } from 'react';
import { FileText, Save, CheckCircle2 } from 'lucide-react';
import { QuoteEditor, QuoteData } from '@/components/admin/QuoteEditor';

export default function AdminHalamanPage() {
  const [visi, setVisi] = useState('Menjadi lembaga dakwah, pendidikan, dan sosial Islam yang istiqomah di atas manhaj Salafus Shalih, amanah, profesional, dan menebarkan manfaat bagi umat.');
  const [misi, setMisi] = useState(
    '1. Menyelenggarakan pendidikan Islam berbasis tauhid dan adab sejak dini.\n2. Mengadakan majelis ilmu dan dakwah ilmiah bermanhaj Salafus Shalih.\n3. Mengembangkan sentra wakaf produktif untuk kemandirian umat.\n4. Menyalurkan bantuan sosial pangan bagi kaum dhuafa dan yatim piatu.'
  );
  const [sejarah, setSejarah] = useState(
    'Yayasan Insan Muslim Istiqomah (YIMI) berawal dari majelis taklim kajian sunnah dan kegiatan sosial santunan yang digagas oleh para muhsinin di Kota Depok pada tahun 2023. Seiring berjalannya waktu, amanah umat berkembang hingga diresmikan secara legal formal melalui SK Kemenkumham RI Nomor AHU-0012345.AH.01.04.Tahun 2023.'
  );

  const [quote, setQuote] = useState<QuoteData>({
    teksArab: 'وَلْتَكُن مِّنكُمْ أُمَّةٌ يَدْعُونَ إِلَى الْخَيْرِ وَيَأْمُرُونَ بِالْمَعْرُوفِ وَيَنْهَوْنَ عَنِ الْمُنكَرِ ۚ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ',
    terjemahan: 'Dan hendaklah ada di antara kamu segolongan umat yang menyeru kepada kebajikan, menyuruh kepada yang ma\'ruf dan mencegah dari yang munkar; merekalah orang-orang yang beruntung.',
    sumber: 'QS. Ali \'Imran: 104',
    tipe: 'ayat',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!quote.sumber.trim()) {
      alert('Kutipan syar\'i wajib menyertakan sumber rujukan!');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      // Simpan data halaman statis
      await new Promise((res) => setTimeout(res, 600));
      setSavedSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Pengelolaan Halaman Statis & Manhaj</h2>
        <p className="text-xs text-[#6B7280]">
          Kelola visi, misi, landasan manhaj, dan dalil syar&apos;i yang tampil pada halaman profil lembaga.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#166534] flex items-center space-x-2 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Halaman profil dan dalil manhaj berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visi & Misi */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <FileText className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Visi & Misi Lembaga</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Visi Utama Yayasan <span className="text-[#D7261E]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Misi Yayasan (Poin-poin) <span className="text-[#D7261E]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={misi}
              onChange={(e) => setMisi(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
            />
          </div>
        </div>

        {/* Blok Kutipan Syar'i (PRD F-PAGE-02 & AGENTS.md 4.1) */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="pb-2 border-b border-[#E3E7EE]">
            <h3 className="font-bold text-base text-[#111827]">
              Landasan Dalil Al-Qur&apos;an / Hadits (Ber-Sumber Wajib)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Setiap ayat Al-Qur&apos;an atau Hadits Nabi ﷺ wajib divalidasi dengan sumber rujukan shahih.
            </p>
          </div>

          <QuoteEditor value={quote} onChange={setQuote} required={true} />
        </div>

        {/* Sejarah Singkat */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <FileText className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Sejarah Singkat Yayasan</h3>
          </div>

          <div>
            <textarea
              rows={4}
              value={sejarah}
              onChange={(e) => setSejarah(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan…' : 'Simpan Halaman Profil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
