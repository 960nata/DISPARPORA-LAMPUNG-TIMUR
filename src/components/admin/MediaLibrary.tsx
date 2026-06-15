"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Search, Image as ImageIcon, Check, Pencil, Trash2 } from "lucide-react";

export interface MediaItem {
  id: string;
  src: string;       // base64 or URL
  name: string;
  alt: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = "simad_media_library";

function loadMedia(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMedia(items: MediaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface Props {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
  multi?: boolean;
  selected?: string[];
  onMultiSelect?: (items: MediaItem[]) => void;
}

export default function MediaLibrary({ onSelect, onClose, multi, selected = [], onMultiSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", alt: "", description: "" });
  const [multiSel, setMultiSel] = useState<string[]>(selected);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setItems(loadMedia()); }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newItem: MediaItem = {
          id: `media_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          src: reader.result as string,
          name: file.name.replace(/\.[^.]+$/, ""),
          alt: file.name.replace(/\.[^.]+$/, ""),
          description: "",
          createdAt: new Date().toISOString(),
        };
        setItems(prev => {
          const updated = [newItem, ...prev];
          saveMedia(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      saveMedia(updated);
      return updated;
    });
    setMultiSel(prev => prev.filter(i => i !== id));
  };

  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, alt: item.alt, description: item.description });
  };

  const saveEdit = () => {
    setItems(prev => {
      const updated = prev.map(i => i.id === editingId ? { ...i, ...editForm } : i);
      saveMedia(updated);
      return updated;
    });
    setEditingId(null);
  };

  const toggleMulti = (id: string) => {
    setMultiSel(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.alt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="dash-card" style={{ width: "100%", maxWidth: "900px", maxHeight: "85vh", display: "flex", flexDirection: "column", backgroundColor: "var(--dash-card)" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <ImageIcon size={20} style={{ color: "var(--dash-primary)" }} />
          <h3 style={{ margin: 0, fontWeight: 800, color: "white", fontSize: "1rem" }}>Media Library</h3>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "var(--dash-card-2)" }}>
            <Search size={15} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
            <input type="text" placeholder="Cari gambar..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: "white", fontSize: "0.85rem", width: "160px" }} />
          </div>
          <button onClick={() => fileRef.current?.click()} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
            <Upload size={15} /> Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleUpload} />
          {multi && multiSel.length > 0 && (
            <button onClick={() => { const sel = items.filter(i => multiSel.includes(i.id)); onMultiSelect?.(sel); onClose(); }}
              className="dash-btn" style={{ backgroundColor: "var(--dash-success)", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              <Check size={15} /> Pilih ({multiSel.length})
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "0.25rem" }}><X size={20} /></button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--dash-text-muted)" }}>
              <ImageIcon size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
              <p>Belum ada gambar. Upload gambar untuk mulai.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
              {filtered.map(item => {
                const isSel = multiSel.includes(item.id);
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} style={{ borderRadius: "12px", overflow: "hidden", border: `2px solid ${isSel ? "var(--dash-primary)" : "var(--dash-border)"}`, backgroundColor: "var(--dash-card-2)", position: "relative", cursor: "pointer" }}>
                    {isEditing ? (
                      <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <img src={item.src} alt={item.alt} style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px" }} />
                        <input className="dash-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} placeholder="Nama" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                        <input className="dash-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} placeholder="Alt text" value={editForm.alt} onChange={e => setEditForm(p => ({ ...p, alt: e.target.value }))} />
                        <textarea className="dash-input" rows={2} style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem", resize: "none" }} placeholder="Deskripsi" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={saveEdit} className="dash-btn" style={{ flex: 1, fontSize: "0.72rem", padding: "0.3rem" }}>Simpan</button>
                          <button onClick={() => setEditingId(null)} className="dash-btn" style={{ flex: 1, fontSize: "0.72rem", padding: "0.3rem", backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => { if (multi) toggleMulti(item.id); else { onSelect(item); onClose(); } }} style={{ position: "relative" }}>
                          <img src={item.src} alt={item.alt} style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }} />
                          {isSel && (
                            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--dash-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={16} color="white" /></div>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: "0.6rem 0.75rem" }}>
                          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name || "Tanpa nama"}</p>
                          {item.alt && <p style={{ margin: "0.1rem 0 0", fontSize: "0.65rem", color: "var(--dash-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.alt}</p>}
                          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                            <button onClick={() => startEdit(item)} style={{ flex: 1, padding: "0.25rem", borderRadius: "6px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}><Pencil size={11} /> Edit</button>
                            <button onClick={() => handleDelete(item.id)} style={{ padding: "0.25rem 0.4rem", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "var(--dash-danger)", cursor: "pointer" }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
