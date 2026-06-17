'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Images, UploadCloud, CheckCircle, Trash2,
  Loader2, Plus, Search, FileText, Check,
  Pin, Save, X, Edit2, Tag, Info, AlertCircle,
  ChevronLeft, ChevronRight, ZoomIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/contexts/AdminContext';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

const PIN_KEY = 'simad_gallery_pinned';
const PIN_MAX = 40;

const CATEGORIES = ['Alam', 'Bahari', 'Budaya', 'Sejarah', 'Kuliner', 'Event', 'Lainnya'];

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';
interface QueueFile { file: File; preview: string; status: UploadStatus; }

const fileToBase64 = (file: File): Promise<string> =>
  new Promise(resolve => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file); });

export default function GaleriPage() {
  const { user } = useAdmin();
  const [mediaFiles, setMediaFiles] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'other'>('all');

  // Modals
  const [isMultiUploadOpen, setIsMultiUploadOpen] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<GalleryItem | null>(null);

  // Multi-upload
  const [multiUploadFiles, setMultiUploadFiles] = useState<QueueFile[]>([]);
  const [isDraggingMulti, setIsDraggingMulti] = useState(false);
  const [uploadingMulti, setUploadingMulti] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Single upload
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCategory, setSingleCategory] = useState('Alam');
  const [uploadingSingle, setUploadingSingle] = useState(false);
  const [isDraggingSingle, setIsDraggingSingle] = useState(false);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Edit metadata
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Alam');
  const [savingEdit, setSavingEdit] = useState(false);

  // Pin/Featured
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [savingPin, setSavingPin] = useState(false);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Batch upload progress
  const [batchUploading, setBatchUploading] = useState(false);

  // ── Computed ──
  const filteredMedia = mediaFiles.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTag = selectedTag === 'Semua' || m.category === selectedTag;
    return matchSearch && matchTag;
  });

  const uniqueTagsList = Array.from(new Set(mediaFiles.map(m => m.category))).sort();

  // ── Load ──
  const fetchMedia = useCallback(() => {
    setLoading(true);
    fetch('/api/gallery').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMediaFiles(data.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMedia();
    try { setPinnedIds(new Set(JSON.parse(localStorage.getItem(PIN_KEY) || '[]'))); } catch {}
  }, [fetchMedia]);

  // ── Lightbox keyboard ──
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = useCallback(() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback((len: number) => setLightboxIdx(i => (i !== null && i < len - 1 ? i + 1 : i)), []);
  const filteredLen = filteredMedia.length;
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto(filteredLen);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, filteredLen, prevPhoto, nextPhoto]);

  if (!user) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dash-text-muted)' }}><Images size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} /><p>Akses ditolak.</p></div>;

  // ── Pin ──
  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else if (n.size < PIN_MAX) n.add(id);
      return n;
    });
  };
  const handleSavePin = () => {
    setSavingPin(true);
    localStorage.setItem(PIN_KEY, JSON.stringify([...pinnedIds]));
    setTimeout(() => setSavingPin(false), 800);
    alert(`${pinnedIds.size} foto berhasil disimpan sebagai unggulan beranda.`);
  };

  // ── Multi Upload ──
  const addMultiFiles = async (files: File[]) => {
    const imgFiles = files.filter(f => f.type.startsWith('image/'));
    const entries: QueueFile[] = await Promise.all(imgFiles.map(async file => ({
      file, preview: URL.createObjectURL(file), status: 'pending' as UploadStatus,
    })));
    setMultiUploadFiles(prev => [...prev, ...entries]);
  };

  const handleStartMultiUpload = async () => {
    setBatchUploading(true);
    const updated = [...multiUploadFiles];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;
      updated[i] = { ...updated[i], status: 'uploading' };
      setMultiUploadFiles([...updated]);
      try {
        const base64 = await fileToBase64(updated[i].file);
        const res = await fetch('/api/gallery', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: updated[i].file.name.replace(/\.[^.]+$/, ''), category: 'Lainnya', imageData: base64 }),
        });
        const data = await res.json();
        updated[i] = { ...updated[i], status: res.ok ? 'success' : 'error' };
        if (res.ok) setMediaFiles(prev => [data, ...prev]);
      } catch { updated[i] = { ...updated[i], status: 'error' }; }
      setMultiUploadFiles([...updated]);
    }
    setBatchUploading(false);
    fetchMedia();
  };

  // ── Single Upload ──
  const handleSingleFileSelect = async (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSingleFile(file);
    setSinglePreview(URL.createObjectURL(file));
    if (!singleTitle) setSingleTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleStartSingleUpload = async () => {
    if (!singleFile || !singleTitle.trim()) { alert('Judul dan gambar wajib diisi.'); return; }
    setUploadingSingle(true);
    try {
      const base64 = await fileToBase64(singleFile);
      const res = await fetch('/api/gallery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: singleTitle.trim(), category: singleCategory, imageData: base64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah');
      setMediaFiles(prev => [json, ...prev]);
      setIsAddPhotoOpen(false);
      setSingleFile(null); setSinglePreview(''); setSingleTitle(''); setSingleCategory('Alam');
    } catch (e: any) { alert(e.message); }
    finally { setUploadingSingle(false); }
  };

  // ── Edit ──
  const openEditModal = (media: GalleryItem) => {
    setEditingMedia(media); setEditTitle(media.title); setEditCategory(media.category);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/gallery/${editingMedia.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), category: editCategory }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Gagal'); }
      setMediaFiles(prev => prev.map(m => m.id === editingMedia.id ? { ...m, title: editTitle, category: editCategory } : m));
      setIsEditModalOpen(false); setEditingMedia(null);
    } catch (e: any) { alert(e.message); }
    finally { setSavingEdit(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus foto ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Gagal'); }
      setMediaFiles(prev => prev.filter(m => m.id !== id));
      setPinnedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      if (editingMedia?.id === id) { setIsEditModalOpen(false); setEditingMedia(null); }
    } catch (e: any) { alert(e.message); }
  };

  // ─────────────────────────────────────────────────
  // Styles (replace Tailwind → SIMAD design tokens)
  // ─────────────────────────────────────────────────
  const S = {
    page: { maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' } as React.CSSProperties,
    // header
    header: { display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--dash-border)', paddingBottom: '1.25rem' } as React.CSSProperties,
    h1: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--dash-text)', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 } as React.CSSProperties,
    h1Icon: { padding: '0.45rem', background: 'var(--dash-primary-bg)', color: 'var(--dash-primary)', borderRadius: '10px', display: 'flex' } as React.CSSProperties,
    subtext: { color: 'var(--dash-text-muted)', fontSize: '0.82rem', fontWeight: 500, marginTop: '0.25rem' } as React.CSSProperties,
    headerActions: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', alignItems: 'center' } as React.CSSProperties,
    btnDark: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#fff', background: 'var(--dash-text)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' } as React.CSSProperties,
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#fff', background: 'var(--dash-primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--dash-primary)' } as React.CSSProperties,
    btnSuccess: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#fff', background: 'var(--dash-success)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--dash-success)' } as React.CSSProperties,
    // multi-upload zone
    multiBox: { background: 'var(--dash-surface-hover)', border: '1px solid var(--dash-border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' } as React.CSSProperties,
    multiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--dash-border)' } as React.CSSProperties,
    multiTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--dash-text)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' } as React.CSSProperties,
    dropZone: (active: boolean): React.CSSProperties => ({ border: `1.5px dashed ${active ? 'var(--dash-primary)' : 'var(--dash-border-2)'}`, borderRadius: '12px', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', textAlign: 'center', background: active ? 'var(--dash-primary-bg)' : 'var(--dash-card)', minHeight: '140px', transition: 'all 0.2s' }),
    queueItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', border: '1px solid var(--dash-border)', borderRadius: '10px', background: 'var(--dash-card)', gap: '0.65rem' } as React.CSSProperties,
    // alert badge
    alertBadge: { background: 'var(--dash-primary-bg)', border: '1px solid var(--dash-primary)', borderRadius: '12px', padding: '0.65rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-primary)' } as React.CSSProperties,
    alertCount: { width: '26px', height: '26px', borderRadius: '50%', background: 'var(--dash-card)', border: '1px solid var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: 'var(--dash-primary)', flexShrink: 0 } as React.CSSProperties,
    // filter bar
    filterBar: { display: 'flex', flexWrap: 'wrap' as const, gap: '1rem', alignItems: 'center', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', padding: '0.85rem 1rem', borderRadius: '14px' } as React.CSSProperties,
    filterPill: (active: boolean): React.CSSProperties => ({ padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: active ? 'var(--dash-text)' : 'var(--dash-surface-hover)', color: active ? '#fff' : 'var(--dash-text-soft)' }),
    tagPill: (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${active ? 'var(--dash-primary)' : 'var(--dash-border)'}`, background: active ? 'var(--dash-primary-bg)' : 'var(--dash-card)', color: active ? 'var(--dash-primary)' : 'var(--dash-text-soft)', whiteSpace: 'nowrap' as const, transition: 'all 0.15s' }),
    searchWrap: { position: 'relative', flex: '1 1 200px', maxWidth: '280px' } as React.CSSProperties,
    // card
    card: { position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--dash-border)', background: 'var(--dash-card)', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' } as React.CSSProperties,
    // modal overlay
    overlay: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '1rem' } as React.CSSProperties,
    modal: { background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)' } as React.CSSProperties,
    modalTitle: { fontWeight: 800, fontSize: '0.92rem', color: 'var(--dash-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 } as React.CSSProperties,
    modalBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' as const } as React.CSSProperties,
    modalFooter: { borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', alignItems: 'center' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.35rem' } as React.CSSProperties,
    btnGhost: { padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-primary)', background: 'var(--dash-primary-bg)', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' } as React.CSSProperties,
    btnCancel: { padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text-soft)', background: 'var(--dash-surface-hover)', border: '1px solid var(--dash-border)', borderRadius: '10px', cursor: 'pointer' } as React.CSSProperties,
    btnDanger: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dash-danger)', background: 'var(--dash-danger-bg)', border: '1px solid var(--dash-danger)', borderRadius: '10px', cursor: 'pointer' } as React.CSSProperties,
  };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <h1 style={S.h1}>
              <span style={S.h1Icon}><Images size={22} /></span>
              Manajemen Galeri
            </h1>
            <p style={S.subtext}>Upload foto kegiatan, beri judul/kategori, dan pilih untuk tampil di beranda.</p>
          </div>
          <div style={S.headerActions}>
            <button onClick={() => { setMultiUploadFiles([]); setIsMultiUploadOpen(v => !v); }} style={S.btnDark}>
              <UploadCloud size={14} /> Unggah Sekaligus
            </button>
            <button onClick={() => { setSingleFile(null); setSinglePreview(''); setSingleTitle(''); setSingleCategory('Alam'); setIsAddPhotoOpen(true); }} style={S.btnPrimary}>
              <Plus size={14} /> Tambah Foto
            </button>
            <button onClick={handleSavePin} disabled={savingPin} style={S.btnSuccess}>
              {savingPin ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              Simpan Pilihan
            </button>
          </div>
        </div>
      </div>

      {/* Inline Multi-Upload Zone */}
      <AnimatePresence>
        {isMultiUploadOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={S.multiBox}>
              <div style={S.multiHeader}>
                <div style={S.multiTitle}>
                  <UploadCloud size={15} style={{ color: 'var(--dash-success)' }} />
                  Unggah Banyak Foto Sekaligus
                </div>
                <button onClick={() => setIsMultiUploadOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Tutup</button>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setIsDraggingMulti(true); }}
                onDragLeave={() => setIsDraggingMulti(false)}
                onDrop={e => { e.preventDefault(); setIsDraggingMulti(false); addMultiFiles(Array.from(e.dataTransfer.files)); }}
                onClick={() => multiFileInputRef.current?.click()}
                style={S.dropZone(isDraggingMulti)}>
                <div style={{ padding: '0.65rem', background: 'var(--dash-success-bg)', color: 'var(--dash-success)', borderRadius: '50%', display: 'flex' }}>
                  <UploadCloud size={22} />
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--dash-text)' }}>Seret & jatuhkan beberapa gambar ke sini</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--dash-text-muted)' }}>atau</p>
                <button type="button" style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', fontSize: '0.78rem', fontWeight: 700, padding: '0.45rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>
                  Pilih Berkas Gambar
                </button>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PNG, JPG, AVIF (MAKS 5MB per file)</p>
                <input type="file" ref={multiFileInputRef} onChange={e => addMultiFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} multiple accept="image/*" />
              </div>

              {multiUploadFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Berkas Terpilih ({multiUploadFiles.length})</span>
                    <button onClick={() => setMultiUploadFiles([])} style={{ background: 'none', border: 'none', color: 'var(--dash-danger)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Hapus Semua</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }} className="dash-scroll">
                    {multiUploadFiles.map((item, idx) => (
                      <div key={idx} style={S.queueItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                          {item.preview
                            ? <img src={item.preview} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '7px', border: '1px solid var(--dash-border)', flexShrink: 0 }} />
                            : <div style={{ width: '36px', height: '36px', background: 'var(--dash-surface-hover)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={16} style={{ color: 'var(--dash-text-muted)' }} /></div>
                          }
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--dash-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file.name}</p>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--dash-text-muted)' }}>{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        {item.status === 'pending' && <button onClick={() => setMultiUploadFiles(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', flexShrink: 0 }}><X size={13} /></button>}
                        {item.status === 'uploading' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--dash-warning)', flexShrink: 0 }} />}
                        {item.status === 'success' && <CheckCircle size={14} style={{ color: 'var(--dash-success)', flexShrink: 0 }} />}
                        {item.status === 'error' && <AlertCircle size={14} style={{ color: 'var(--dash-danger)', flexShrink: 0 }} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--dash-border)' }}>
                    <button onClick={handleStartMultiUpload} disabled={batchUploading} style={S.btnPrimary}>
                      {batchUploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={14} />}
                      {batchUploading ? 'Mengunggah...' : 'Mulai Unggah'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Badge */}
      <div style={S.alertBadge}>
        <div style={S.alertCount}>{pinnedIds.size}</div>
        <span>Foto terpilih untuk Unggulan Beranda (Maksimal {PIN_MAX})</span>
      </div>

      {/* Filter + Search */}
      <div style={S.filterBar}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'image', 'other'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={S.filterPill(filterType === t)}>
              {t === 'all' ? 'Semua File' : t === 'image' ? 'Gambar' : 'Lainnya'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
          <button onClick={() => setSelectedTag('Semua')} style={S.tagPill(selectedTag === 'Semua')}>Semua Tag</button>
          {uniqueTagsList.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag)} style={S.tagPill(selectedTag === tag)}>
              <Tag size={11} style={{ color: 'inherit', opacity: 0.7 }} /> {tag}
            </button>
          ))}
        </div>
        <div style={S.searchWrap}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', pointerEvents: 'none' }} />
          <input className="dash-input" type="text" placeholder="Cari foto media..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '32px', width: '100%', boxSizing: 'border-box', fontSize: '0.82rem' }} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '16px', gap: '0.75rem' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--dash-primary)' }} />
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Memuat pustaka media...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '16px', padding: '5rem', textAlign: 'center' }}>
          <Images size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--dash-text-muted)' }} />
          <h3 style={{ fontWeight: 800, color: 'var(--dash-text)', fontSize: '1rem', margin: '0 0 0.4rem' }}>Pustaka Media Kosong</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.84rem', margin: 0 }}>{searchTerm ? 'Tidak ada media yang cocok.' : 'Tambah foto menggunakan tombol di atas.'}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredMedia.map((media, i) => {
            const isPinned = pinnedIds.has(media.id);
            return (
              <div key={media.id} className="gallery-grid-card" style={{ ...S.card, ...(isPinned ? { borderColor: 'var(--dash-primary)' } : {}) }} onClick={() => openEditModal(media)}>
                {/* Checkbox */}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 2 }} onClick={e => { e.stopPropagation(); togglePin(media.id); }}>
                  <div style={{ width: '20px', height: '20px', background: isPinned ? 'var(--dash-primary)' : 'rgba(255,255,255,0.9)', border: `1px solid ${isPinned ? 'var(--dash-primary)' : 'rgba(0,0,0,0.2)'}`, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                    {isPinned && <Check size={12} style={{ color: '#fff', strokeWidth: 3 }} />}
                  </div>
                </div>

                {/* Pin badge */}
                {isPinned && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '1.8rem', zIndex: 2, background: 'var(--dash-primary)', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '0.2rem', backdropFilter: 'blur(4px)' }}>
                    <Pin size={9} /> Unggulan
                  </div>
                )}

                {/* Image */}
                <img src={media.imageUrl} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', display: 'block' }} className="gallery-grid-img" onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.25'; }} />

                {/* Edit overlay */}
                <div className="gallery-grid-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                  <div style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.95)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', color: 'var(--dash-primary)' }}>
                    <Edit2 size={15} />
                  </div>
                </div>

                {/* Title bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.4), transparent)', padding: '1.75rem 0.65rem 0.55rem', pointerEvents: 'none' }}>
                  <p style={{ margin: 0, color: '#fff', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media.title}</p>
                  {media.category && (
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Tag size={9} /> {media.category}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: Tambah Foto Baru ── */}
      <AnimatePresence>
        {isAddPhotoOpen && (
          <div style={S.overlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ ...S.modal, maxWidth: '600px' }}>
              <div style={S.modalHeader}>
                <p style={S.modalTitle}><Plus size={16} style={{ color: 'var(--dash-primary)' }} /> Tambah Foto Baru</p>
                <button onClick={() => { if (!uploadingSingle) setIsAddPhotoOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
              </div>
              <div style={{ ...S.modalBody, maxHeight: '65vh' }}>
                {!singleFile ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDraggingSingle(true); }}
                    onDragLeave={() => setIsDraggingSingle(false)}
                    onDrop={e => { e.preventDefault(); setIsDraggingSingle(false); handleSingleFileSelect(e.dataTransfer.files?.[0]); }}
                    onClick={() => singleFileInputRef.current?.click()}
                    style={S.dropZone(isDraggingSingle)}>
                    <UploadCloud size={32} style={{ color: 'var(--dash-text-muted)' }} />
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--dash-text)' }}>Pilih berkas atau seret di sini</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Mendukung AVIF, WEBP, PNG, JPG</p>
                    <input type="file" ref={singleFileInputRef} onChange={e => handleSingleFileSelect(e.target.files?.[0])} style={{ display: 'none' }} accept="image/*" />
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={singlePreview} alt="" style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} />
                    <button onClick={() => { setSingleFile(null); setSinglePreview(''); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={14} /></button>
                  </div>
                )}
                <div>
                  <label style={S.label}>Judul Gambar</label>
                  <input className="dash-input" type="text" value={singleTitle} onChange={e => setSingleTitle(e.target.value)} placeholder="Masukkan judul gambar" style={{ fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={S.label}>Kategori</label>
                  <select className="dash-input" value={singleCategory} onChange={e => setSingleCategory(e.target.value)} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ ...S.modalFooter, justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button onClick={() => setIsAddPhotoOpen(false)} disabled={uploadingSingle} style={S.btnCancel}>Batal</button>
                <button onClick={handleStartSingleUpload} disabled={!singleFile || uploadingSingle} style={S.btnPrimary}>
                  {uploadingSingle ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={14} />}
                  {uploadingSingle ? 'Mengunggah...' : 'Unggah & Simpan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Edit Informasi Foto ── */}
      <AnimatePresence>
        {isEditModalOpen && editingMedia && (
          <div style={S.overlay}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ ...S.modal, maxWidth: '440px' }}>
              <div style={S.modalHeader}>
                <p style={S.modalTitle}><Info size={15} style={{ color: 'var(--dash-primary)' }} /> Edit Informasi Foto</p>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px' }}><X size={17} /></button>
              </div>
              <div style={S.modalBody}>
                <div style={{ background: 'var(--dash-bg)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--dash-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
                  <img src={editingMedia.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div>
                  <label style={S.label}>Nama Gambar / Judul</label>
                  <input className="dash-input" type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Masukkan nama/judul foto..." style={{ fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={S.label}>Kategori</label>
                  <select className="dash-input" value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ ...S.modalFooter, justifyContent: 'space-between' }}>
                <button onClick={() => handleDelete(editingMedia.id)} style={S.btnDanger}><Trash2 size={13} /> Hapus</button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setIsEditModalOpen(false)} style={S.btnCancel}>Batal</button>
                  <button onClick={handleSaveEdit} disabled={savingEdit} style={S.btnPrimary}>
                    {savingEdit ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && filteredMedia[lightboxIdx] && (() => {
        const item = filteredMedia[lightboxIdx];
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={closeLightbox}>
            <button onClick={e => { e.stopPropagation(); prevPhoto(); }} disabled={lightboxIdx === 0} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: lightboxIdx === 0 ? 'not-allowed' : 'pointer', opacity: lightboxIdx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><ChevronLeft size={20} /></button>
            <div style={{ maxWidth: 'min(90vw,1100px)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
              <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', maxHeight: 'calc(85vh - 80px)', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ background: 'var(--dash-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{item.category}</span>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 700 }}>{item.title}</p>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{lightboxIdx + 1} / {filteredLen}</span>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); nextPhoto(filteredLen); }} disabled={lightboxIdx === filteredLen - 1} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: lightboxIdx === filteredLen - 1 ? 'not-allowed' : 'pointer', opacity: lightboxIdx === filteredLen - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><ChevronRight size={20} /></button>
            <button onClick={closeLightbox} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><X size={17} /></button>
          </div>
        );
      })()}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .gallery-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.75rem; }
        @media (max-width: 1400px) { .gallery-grid { grid-template-columns: repeat(7, 1fr); } }
        @media (max-width: 1200px) { .gallery-grid { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 1000px) { .gallery-grid { grid-template-columns: repeat(5, 1fr); } }
        @media (max-width: 768px)  { .gallery-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 560px)  { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
        .gallery-grid-card:hover .gallery-grid-overlay { opacity: 1 !important; }
        .gallery-grid-card:hover .gallery-grid-img { transform: scale(1.04); }
        .gallery-grid-card:hover { border-color: var(--dash-primary) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
