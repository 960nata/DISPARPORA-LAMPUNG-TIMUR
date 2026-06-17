'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Images, Check, X, Search, Loader2, Tag, RefreshCw, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

const CATEGORIES = ['Alam', 'Bahari', 'Budaya', 'Sejarah', 'Kuliner', 'Event', 'Lainnya'];

type Props = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(file); });

export default function GalleryWidget({ selectedIds, onChange, caption = '', onCaptionChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [tab, setTab] = useState<'gallery' | 'upload'>('gallery');

  // Gallery tab
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');

  // Upload tab
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCat, setUploadCat] = useState('Lainnya');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch('/api/gallery').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (showPicker) fetchItems(); }, [showPicker, fetchItems]);

  const categories = ['Semua', ...Array.from(new Set(items.map(i => i.category))).sort()];
  const filtered = items.filter(i => {
    const matchS = i.title.toLowerCase().includes(search.toLowerCase());
    const matchC = catFilter === 'Semua' || i.category === catFilter;
    return matchS && matchC;
  });

  const toggleSelect = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  const selectedItems = items.filter(i => selectedIds.includes(i.id));

  const handleFileSelect = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) { alert('Pilih file dan isi judul terlebih dahulu.'); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(uploadFile);
      const res = await fetch('/api/gallery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: uploadTitle.trim(), category: uploadCat, imageData: base64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah');
      setItems(prev => [json, ...prev]);
      onChange([...selectedIds, json.id]);
      setUploadStatus('success');
      setUploadFile(null); setUploadPreview(''); setUploadTitle(''); setUploadCat('Lainnya');
      setTimeout(() => { setUploadStatus('idle'); setTab('gallery'); }, 1200);
    } catch (e: any) {
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  // ── Styles ──
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '0.28rem 0.7rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
    cursor: 'pointer', border: `1px solid ${active ? 'var(--dash-primary)' : 'var(--dash-border)'}`,
    background: active ? 'var(--dash-primary-bg)' : 'var(--dash-card)',
    color: active ? 'var(--dash-primary)' : 'var(--dash-text-soft)', transition: 'all 0.15s',
  });

  const gridCard = (selected: boolean): React.CSSProperties => ({
    position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden',
    border: `2px solid ${selected ? 'var(--dash-primary)' : 'var(--dash-border)'}`,
    cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: selected ? '0 0 0 3px var(--dash-primary-bg)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Preview selected photos */}
      {selectedItems.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.45rem' }}>
          {selectedItems.map(item => (
            <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--dash-border)' }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => toggleSelect(item.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={11} /></button>
            </div>
          ))}
        </div>
      )}

      {onCaptionChange && (
        <input className="dash-input" type="text" value={caption} onChange={e => onCaptionChange(e.target.value)} placeholder="Keterangan galeri (opsional)..." style={{ fontSize: '0.82rem' }} />
      )}

      <button onClick={() => setShowPicker(true)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: '9px', border: '1px solid var(--dash-border)', background: selectedIds.length ? 'var(--dash-surface-hover)' : 'var(--dash-primary)', color: selectedIds.length ? 'var(--dash-text-soft)' : '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s' }}>
        <Images size={14} />
        {selectedIds.length ? `Ubah Pilihan (${selectedIds.length} foto)` : 'Pilih atau Upload Foto'}
      </button>

      {/* ── PICKER MODAL ── */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', width: '100%', maxWidth: '860px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Images size={16} style={{ color: 'var(--dash-primary)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--dash-text)' }}>Media Foto</span>
              </div>
              <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', flexShrink: 0 }}>
              {([['gallery', 'Pilih dari Galeri'], ['upload', 'Upload Manual']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} style={{ padding: '0.75rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: tab === key ? 'var(--dash-primary)' : 'var(--dash-text-muted)', background: 'none', border: 'none', borderBottom: tab === key ? '2px solid var(--dash-primary)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── TAB: Pilih dari Galeri ── */}
            {tab === 'gallery' && (
              <>
                <div style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--dash-border)', flexShrink: 0 }}>
                  <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
                    <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)', pointerEvents: 'none' }} />
                    <input className="dash-input" type="text" placeholder="Cari foto..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '30px', fontSize: '0.82rem', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {categories.map(c => <button key={c} onClick={() => setCatFilter(c)} style={pill(catFilter === c)}>{c}</button>)}
                  </div>
                  <button onClick={fetchItems} style={{ background: 'none', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '0.35rem 0.65rem', color: 'var(--dash-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700 }}>
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }} className="dash-scroll">
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
                      <Loader2 size={24} style={{ animation: 'gw-spin 1s linear infinite', color: 'var(--dash-primary)' }} />
                      <span style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>Memuat foto...</span>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                      <Images size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Tidak ada foto. Gunakan tab Upload Manual.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem' }}>
                      {filtered.map(item => {
                        const selected = selectedIds.includes(item.id);
                        return (
                          <div key={item.id} style={gridCard(selected)} onClick={() => toggleSelect(item.id)}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {selected && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,150,105,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--dash-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                  <Check size={15} style={{ color: '#fff', strokeWidth: 3 }} />
                                </div>
                              </div>
                            )}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78), transparent)', padding: '1.25rem 0.45rem 0.4rem' }}>
                              <p style={{ margin: 0, color: '#fff', fontSize: '0.62rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>{selectedIds.length} foto dipilih</span>
                  <button onClick={() => setShowPicker(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: 'var(--dash-primary)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px -4px var(--dash-primary)' }}>
                    Selesai
                  </button>
                </div>
              </>
            )}

            {/* ── TAB: Upload Manual ── */}
            {tab === 'upload' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Drop zone */}
                  {!uploadPreview ? (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
                      onClick={() => fileRef.current?.click()}
                      style={{ border: `2px dashed ${isDragging ? 'var(--dash-primary)' : 'var(--dash-border)'}`, borderRadius: '14px', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', textAlign: 'center', background: isDragging ? 'var(--dash-primary-bg)' : 'var(--dash-surface-hover)', transition: 'all 0.2s' }}>
                      <div style={{ padding: '0.75rem', background: 'var(--dash-primary-bg)', color: 'var(--dash-primary)', borderRadius: '50%', display: 'flex' }}>
                        <UploadCloud size={26} />
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--dash-text)' }}>Seret & jatuhkan gambar di sini</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>atau</p>
                      <button type="button" style={{ background: 'var(--dash-card)', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 1.1rem', borderRadius: '10px', cursor: 'pointer' }}>
                        Pilih Berkas Gambar
                      </button>
                      <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>PNG, JPG, AVIF, WEBP</p>
                      <input type="file" ref={fileRef} onChange={e => handleFileSelect(e.target.files?.[0])} accept="image/*" style={{ display: 'none' }} />
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--dash-border)', background: 'var(--dash-surface-hover)', maxHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={uploadPreview} alt="" style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} />
                      <button onClick={() => { setUploadFile(null); setUploadPreview(''); setUploadStatus('idle'); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={14} /></button>
                    </div>
                  )}

                  {/* Status indicator */}
                  {uploadStatus === 'success' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', background: 'var(--dash-success-bg)', border: '1px solid var(--dash-success)', borderRadius: '10px', color: 'var(--dash-success)', fontSize: '0.82rem', fontWeight: 700 }}>
                      <CheckCircle size={16} /> Foto berhasil diupload dan ditambahkan ke pilihan!
                    </div>
                  )}
                  {uploadStatus === 'error' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.9rem', background: 'var(--dash-danger-bg)', border: '1px solid var(--dash-danger)', borderRadius: '10px', color: 'var(--dash-danger)', fontSize: '0.82rem', fontWeight: 700 }}>
                      <AlertCircle size={16} /> Gagal mengupload. Coba lagi.
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Judul Foto</label>
                    <input className="dash-input" type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Masukkan judul foto..." style={{ fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--dash-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Kategori</label>
                    <select className="dash-input" value={uploadCat} onChange={e => setUploadCat(e.target.value)} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--dash-border)', padding: '0.85rem 1.25rem', background: 'var(--dash-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => setTab('gallery')} style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dash-text-soft)', background: 'var(--dash-surface-hover)', border: '1px solid var(--dash-border)', borderRadius: '10px', cursor: 'pointer' }}>
                    ← Ke Galeri
                  </button>
                  <button onClick={handleUpload} disabled={!uploadFile || uploading} style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: !uploadFile || uploading ? 'var(--dash-border)' : 'var(--dash-primary)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: !uploadFile || uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: !uploadFile || uploading ? 'none' : '0 4px 12px -4px var(--dash-primary)' }}>
                    {uploading ? <Loader2 size={14} style={{ animation: 'gw-spin 1s linear infinite' }} /> : <UploadCloud size={14} />}
                    {uploading ? 'Mengupload...' : 'Upload & Tambahkan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes gw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
