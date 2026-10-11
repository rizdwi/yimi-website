/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  Trash2,
  Search,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface MediaItem {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  url: string;
  isSystem?: boolean;
}

const SYSTEM_ASSETS: MediaItem[] = [
  {
    id: 'logo-yimi',
    name: 'logo-yimi.svg',
    size: 4200,
    mimetype: 'image/svg+xml',
    created_at: '2026-10-07T00:00:00Z',
    url: '/logo/logo-yimi.svg',
    isSystem: true,
  },
  {
    id: 'qris-yimi',
    name: 'qris-yimi.svg',
    size: 12800,
    mimetype: 'image/svg+xml',
    created_at: '2026-10-07T00:00:00Z',
    url: '/images/qris-yimi.svg',
    isSystem: true,
  },
  {
    id: 'pattern-star8',
    name: 'pattern-star8.svg',
    size: 1800,
    mimetype: 'image/svg+xml',
    created_at: '2026-10-07T00:00:00Z',
    url: '/patterns/pattern-star8.svg',
    isSystem: true,
  },
];

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'storage' | 'system'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        const storageItems: MediaItem[] = data.files || [];
        setMediaList([...storageItems, ...SYSTEM_ASSETS]);
      } else {
        setMediaList(SYSTEM_ASSETS);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar media:', err);
      setMediaList(SYSTEM_ASSETS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function fetchMedia() {
      try {
        const res = await fetch('/api/admin/media');
        if (res.ok && !ignore) {
          const data = await res.json();
          const storageItems: MediaItem[] = data.files || [];
          setMediaList([...storageItems, ...SYSTEM_ASSETS]);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar media:', err);
        if (!ignore) setMediaList(SYSTEM_ASSETS);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchMedia();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      alert('Pilih berkas gambar (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas maksimal adalah 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah berkas.');
      }

      await loadMedia();
      alert('Berkas berhasil diunggah ke Supabase Storage (yimi-media)!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah';
      alert(`Gagal upload: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deleteTarget.name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus berkas.');
      }

      setMediaList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus berkas';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCopy(url: string, id: string) {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredMedia = mediaList.filter((item) => {
    if (activeTab === 'storage' && item.isSystem) return false;
    if (activeTab === 'system' && !item.isSystem) return false;
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Pustaka Media (Media Library)</h2>
          <p className="text-xs text-[#6B7280]">
            Pusat penyimpanan aset foto &amp; gambar yayasan terhubung langsung ke bucket Supabase Storage (yimi-media).
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,image/svg+xml"
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah ke Storage...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Media Baru</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E3E7EE]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1F2F6B] text-white'
                : 'text-[#6B7280] hover:bg-[#F5F7FA]'
            }`}
          >
            Semua ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-[#1F2F6B] text-white'
                : 'text-[#6B7280] hover:bg-[#F5F7FA]'
            }`}
          >
            Storage Unggahan ({mediaList.filter((m) => !m.isSystem).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'system'
                ? 'bg-[#1F2F6B] text-white'
                : 'text-[#6B7280] hover:bg-[#F5F7FA]'
            }`}
          >
            Aset Branding &amp; Logo ({mediaList.filter((m) => m.isSystem).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama berkas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E3E7EE] rounded-lg text-xs text-[#111827] focus:outline-hidden focus:border-[#3E5FD1]"
          />
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E3E7EE] p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#3E5FD1] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6B7280]">Memuat berkas media dari Supabase Storage...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3E7EE] p-12 text-center">
          <FolderOpen className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#111827]">Tidak Ada Berkas Media</h3>
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            Belum ada berkas media yang cocok. Silakan unggah foto baru dari perangkat Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs hover:border-[#3E5FD1]/40 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-16/9 bg-[#F5F7FA] overflow-hidden flex items-center justify-center border-b border-[#E3E7EE]/60">
                <img
                  src={m.url}
                  alt={m.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src =
                      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop';
                  }}
                />
                <span
                  className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    m.isSystem
                      ? 'bg-neutral-800/80 text-white'
                      : 'bg-[#1F2F6B]/90 text-white'
                  }`}
                >
                  {m.isSystem ? 'Sistem' : 'Storage'}
                </span>
              </div>

              {/* Info Body */}
              <div className="p-3">
                <span
                  title={m.name}
                  className="font-bold text-xs text-[#111827] block truncate"
                >
                  {m.name}
                </span>
                <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-1">
                  <span>{formatBytes(m.size)}</span>
                  <span>{m.created_at ? m.created_at.split('T')[0] : '-'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-3 py-2.5 bg-[#FAFBFD] border-t border-[#E3E7EE] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleCopy(m.url, m.id)}
                  className="inline-flex items-center gap-1 font-semibold text-[#3E5FD1] hover:text-[#1F2F6B] cursor-pointer"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#138A3A]" />
                      <span className="text-[#138A3A] font-bold">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin URL</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka Gambar Asli"
                    className="p-1 text-[#6B7280] hover:text-[#111827] rounded transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {!m.isSystem && (
                    <button
                      type="button"
                      title="Hapus Berkas dari Storage"
                      onClick={() => setDeleteTarget(m)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Berkas Media?"
        message={`Apakah Anda yakin ingin menghapus berkas "${deleteTarget?.name}" dari Supabase Storage? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
