'use client';

import React from 'react';
import { BookMarked } from 'lucide-react';

export interface QuoteData {
  teksArab: string;
  terjemahan: string;
  sumber: string;
  tipe: 'ayat' | 'hadits';
}

interface QuoteEditorProps {
  value: QuoteData;
  onChange: (val: QuoteData) => void;
  required?: boolean;
}

export function QuoteEditor({ value, onChange, required = true }: QuoteEditorProps) {
  const isSourceMissing = required && !value.sumber.trim();

  return (
    <div className="p-4 bg-[#F5F7FA] border border-[#E3E7EE] rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#1F2F6B]">
          <BookMarked className="w-5 h-5 text-[#3E5FD1]" />
          <h4 className="font-semibold text-sm">Blok Kutipan Syar&apos;i (Ayat / Hadits)</h4>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-[#6B7280]">Jenis Kutipan:</label>
          <select
            value={value.tipe}
            onChange={(e) => onChange({ ...value, tipe: e.target.value as 'ayat' | 'hadits' })}
            aria-label="Jenis Kutipan"
            className="text-xs bg-white border border-[#E3E7EE] rounded-md px-2 py-1 text-[#111827] focus:ring-1 focus:ring-[#3E5FD1]"
          >
            <option value="ayat">Ayat Al-Qur&apos;an</option>
            <option value="hadits">Hadits Shahih</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">
          Teks Arab (RTL) <span className="text-[#D7261E]">*</span>
        </label>
        <textarea
          rows={3}
          dir="rtl"
          lang="ar"
          value={value.teksArab}
          onChange={(e) => onChange({ ...value, teksArab: e.target.value })}
          placeholder="أدخل النص العربي مع الحركات..."
          className="w-full text-right font-serif text-lg leading-loose p-3 bg-white border border-[#E3E7EE] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">
          Terjemahan Bahasa Indonesia <span className="text-[#D7261E]">*</span>
        </label>
        <textarea
          rows={2}
          value={value.terjemahan}
          onChange={(e) => onChange({ ...value, terjemahan: e.target.value })}
          placeholder="Artinya: Dan hendaklah ada di antara kamu segolongan umat..."
          className="w-full text-sm p-3 bg-white border border-[#E3E7EE] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-[#111827]">
            Sumber Rujukan Syar&apos;i <span className="text-[#D7261E]">* Wajib Diisi</span>
          </label>
          <span className="text-[11px] text-[#6B7280]">
            Contoh: QS. Ali &apos;Imran: 104 atau HR. Muslim no. 1631
          </span>
        </div>
        <input
          type="text"
          value={value.sumber}
          onChange={(e) => onChange({ ...value, sumber: e.target.value })}
          placeholder={value.tipe === 'ayat' ? 'QS. Ali Imran: 104' : 'HR. Muslim no. 1631'}
          className={`w-full text-sm p-2.5 bg-white border rounded-lg focus:outline-hidden focus:ring-2 ${
            isSourceMissing
              ? 'border-[#D7261E] focus:ring-[#D7261E]'
              : 'border-[#E3E7EE] focus:ring-[#3E5FD1]'
          }`}
        />
        {isSourceMissing && (
          <p className="mt-1 text-xs text-[#D7261E] font-medium">
            Kutipan syar&apos;i wajib menyertakan sumber surat/hadits shahih dan tidak boleh dikosongkan.
          </p>
        )}
      </div>
    </div>
  );
}
