'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Images, Search, RefreshCw, Check, X,
  UploadCloud, CheckCircle, AlertCircle, Loader2, Tag,
} from 'lucide-react';

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

const CATS = ['Alam', 'Bahari', 'Budaya', 'Sejarah', 'Kuliner', 'Event', 'Lainnya'];
const toBase64 = (f: File): Promise<string> =>
  new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f); });

type Props = {
  multi?: boolean;                              // true = multi-select, false = single
  onSelect: (items: GalleryItem[]) => void;     // returns selected items
  onClose: () => void;
  selectedIds?: string[];
};

export default function GalleryPickerModal({ multi = false, onSelect, onClose, selectedIds = [] }: Props) {
  const [tab, setTab] = useState<'gallery' | 'upload'>('gallery');

  // Gallery tab
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Semua');
  const [picked, setPicked] = useState<Set<string>>(new Set(selectedIds));

  // Upload tab
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [upCat, setUpCat] = useState('Lainnya');
  const [uploading, setUploading] = useState(false);
  const [upStatus, setUpStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/gallery').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setItems(d.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = ['Semua', ...Array.from(new Set(items.map(i => i.category))).sort()];
  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) &&
    (cat === 'Semua' || i.category === cat)
  );

  const toggle = (id: string) => {
    if (!multi) {
      const item = items.find(i => i.id === id);
      if (item) { onSelect([item]); onClose(); }
      return;
    }
    setPicked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const confirmMulti = () => {
    onSelect(items.filter(i => picked.has(i.id)));
    onClose();
  };

  const handleFile = (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    setUpStatus('idle');
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) { alert('Pilih file dan isi judul.'); return; }
    setUploading(true);
    try {
      const b64 = await toBase64(file);
      const res = await fetch('/api/gallery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), category: upCat, imageData: b64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal');
      setItems(prev => [json, ...prev]);
      setUpStatus('ok');
      if (!multi) { onSelect([json]); onClose(); return; }
      setPicked(prev => new Set([...prev, json.id]));
      setFile(null); setPreview(''); setTitle(''); setUpCat('Lainnya');
      setTimeout(() => { setUpStatus('idle'); setTab('gallery'); }, 900);
    } catch { setUpStatus('err'); }
    finally { setUploading(false); }
  };

  // ── Styles ──
  const pill = (a: boolean): React.CSSProperties => ({
    padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
    cursor: 'pointer', border: `1px solid ${a ? 'var(--dash-primary)' : 'var(--dash-border)'}`,
    background: a ? 'var(--dash-primary-bg)' : 'var(--dash-card)',
    color: a ? 'var(--dash-primary)' : 'var(--dash-text-soft)', transition: 'all 0.15s',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 11000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', width: '100%', maxWidth: '820px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Images size={16} style={{ color: 'var(--dash-primary)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--dash-text)' }}>
              {multi ? 'Pilih Foto (Multi)' : 'Pilih Foto'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', flexShrink: 0 }}>
          {(['gallery', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.72rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: tab === t ? 'var(--dash-primary)' : 'var(--dash-text-muted)', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--dash-primary)' : '2px solid transparent', cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s' }}>
              {t === 'gallery' ? 'Pilih dari Galeri' : 'Upload Manual'}
            </button>
          ))}
        </div>

        {/* ── TAB GALERI ── */}
        {tab === 'gallery' && (
          <>
            {/* Filter bar */}
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--dash-border)', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', pointerEvents: 'none' }} />
                <input className="dash-input" type="text" placeholder="Cari foto..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '30px', fontSize: '0.82rem', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {categories.map(c => <button key={c} onClick={() => setCat(c)} style={pill(cat === c)}>{c}</button>)}
              </div>
              <button onClick={load} style={{ background: 'none', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '0.3rem 0.6rem', color: 'var(--dash-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700 }}>
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }} className="dash-scroll">
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.65rem' }}>
                  <Loader2 size={22} style={{ animation: 'gpm-spin 1s linear infinite', color: 'var(--dash-primary)' }} />
                  <span style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>Memuat foto...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                  <Images size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Belum ada foto. Upload dulu di tab "Upload Manual".</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.55rem' }}>
                  {filtered.map(item => {
                    const sel = picked.has(item.id);
                    return (
                      <div key={item.id} onClick={() => toggle(item.id)} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${sel ? 'var(--dash-primary)' : 'var(--dash-border)'}`, cursor: 'pointer', transition: 'border-color 0.15s', boxShadow: sel ? '0 0 0 3px var(--dash-primary-bg)' : 'none' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {sel && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,150,105,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                              <Check size={14} style={{ color: '#fff', strokeWidth: 3 }} />
                            </div>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.75),transparent)', padding: '1rem 0.45rem 0.4rem' }}>
                          <p style={{ margin: 0, color: '#fff', fontSize: '0.62rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>
                {multi ? `${picked.size} foto dipilih` : 'Klik foto untuk memilih'}
              </span>
              {multi && (
                <button onClick={confirmMulti} disabled={picked.size === 0} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: picked.size ? 'var(--dash-primary)' : 'var(--dash-border)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: picked.size ? 'pointer' : 'not-allowed', boxShadow: picked.size ? '0 4px 12px -4px var(--dash-primary)' : 'none' }}>
                  Tambahkan ({picked.size})
                </button>
              )}
            </div>
          </>
        )}

        {/* ── TAB UPLOAD ── */}
        {tab === 'upload' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!preview ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${drag ? 'var(--dash-primary)' : 'var(--dash-border)'}`, borderRadius: '14px', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', cursor: 'pointer', textAlign: 'center', background: drag ? 'var(--dash-primary-bg)' : 'var(--dash-surface-hover)', transition: 'all 0.2s' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--dash-primary-bg)', color: 'var(--dash-primary)', borderRadius: '50%', display: 'flex' }}>
                    <UploadCloud size={26} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--dash-text)' }}>Seret & jatuhkan gambar di sini</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>atau</p>
                  <button type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }} style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: '10px', cursor: 'pointer' }}>
                    Pilih Berkas Gambar
                  </button>
                  <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PNG · JPG · AVIF · WEBP</p>
                  <input type="file" ref={fileRef} onChange={e => handleFile(e.target.files?.[0])} accept="image/*" style={{ display: 'none' }} />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} />
                  <button onClick={() => { setFile(null); setPreview(''); setUpStatus('idle'); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={14} /></button>
                </div>
              )}

              {upStatus === 'ok' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', background: 'var(--dash-success-bg)', border: '1px solid var(--dash-success)', borderRadius: '10px', color: 'var(--dash-success)', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle size={16} /> Foto berhasil diupload!
                </div>
              )}
              {upStatus === 'err' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', background: 'var(--dash-danger-bg)', border: '1px solid var(--dash-danger)', borderRadius: '10px', color: 'var(--dash-danger)', fontSize: '0.82rem', fontWeight: 700 }}>
                  <AlertCircle size={16} /> Gagal mengupload. Coba lagi.
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Judul Foto</label>
                <input className="dash-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul foto..." style={{ fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Kategori</label>
                <select className="dash-input" value={upCat} onChange={e => setUpCat(e.target.value)} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => setTab('gallery')} style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text-soft)', background: 'transparent', border: '1px solid var(--dash-border)', borderRadius: '10px', cursor: 'pointer' }}>
                ← Ke Galeri
              </button>
              <button onClick={handleUpload} disabled={!file || uploading} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: !file || uploading ? 'var(--dash-border)' : 'var(--dash-primary)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: !file || uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: !file || uploading ? 'none' : '0 4px 12px -4px var(--dash-primary)' }}>
                {uploading ? <Loader2 size={14} style={{ animation: 'gpm-spin 1s linear infinite' }} /> : <UploadCloud size={14} />}
                {uploading ? 'Mengupload...' : 'Upload & Pilih'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes gpm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
