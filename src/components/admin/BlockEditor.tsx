"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Trash2, Copy,
  Image, Code2, Monitor, ExternalLink, ChevronUp, ChevronDown,
  X, LayoutGrid, Type, Video, Sliders, Images,
} from "lucide-react";
import type { GalleryItem } from "./widgets/GalleryPickerModal";

const QuillEditorWidget    = dynamic(() => import("./widgets/QuillEditorWidget"),    { ssr: false });
const GalleryWidget        = dynamic(() => import("./widgets/GalleryWidget"),        { ssr: false });
const GalleryPickerModal   = dynamic(() => import("./widgets/GalleryPickerModal"),   { ssr: false });

/* ─── Types ─────────────────────────────────── */
export type BlockType =
  | "text" | "image" | "video" | "carousel" | "grid" | "html" | "gallery"
  | "youtube" | "iframe"; // legacy

export interface Block { id: string; type: BlockType; data: Record<string, any>; }

function genId() { return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

/* ─── Video embed helper ─────────────────────── */
function getVideoEmbedUrl(url: string) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

/* ─── Shared label style ─────────────────────── */
const LBL: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 700,
  color: "var(--dash-text-muted)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: "0.35rem",
};

const INPUT: React.CSSProperties = {
  width: "100%", background: "transparent", border: "none",
  borderBottom: "1px solid var(--dash-border)", outline: "none",
  fontSize: "0.85rem", color: "var(--dash-text)", padding: "0.2rem 0",
  boxSizing: "border-box",
};

/* ─── TEXT ───────────────────────────────────── */
function TextBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  return (
    <QuillEditorWidget
      value={block.data.html || ""}
      onChange={html => onChange({ html })}
      placeholder="Tulis konten artikel di sini..."
      minHeight={220}
    />
  );
}

/* ─── IMAGE ──────────────────────────────────── */
function ImageBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const d = block.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {d.src ? (
        <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
          <img src={d.src} alt={d.alt || ""} style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", display: "flex", gap: "0.35rem" }}>
            <button onClick={() => setShowPicker(true)} style={{ padding: "0.35rem 0.7rem", borderRadius: "7px", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" }}>Ganti</button>
            <button onClick={() => onChange({ ...d, src: "" })} style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(220,38,38,0.8)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}><X size={13} /></button>
          </div>
        </div>
      ) : (
        <div onClick={() => setShowPicker(true)} style={{ border: "2px dashed var(--dash-border)", borderRadius: "10px", padding: "2.5rem 1rem", textAlign: "center", cursor: "pointer", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", transition: "all 0.15s" }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--dash-primary-bg)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border)"; (e.currentTarget as HTMLElement).style.background = "var(--dash-surface-hover)"; }}>
          <Image size={28} style={{ marginBottom: "0.5rem", opacity: 0.45 }} />
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Klik untuk pilih gambar</p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", opacity: 0.7 }}>dari Galeri</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <input className="dash-input" placeholder="Alt text" value={d.alt || ""} onChange={e => onChange({ ...d, alt: e.target.value })} style={{ fontSize: "0.82rem" }} />
        <input className="dash-input" placeholder="Keterangan gambar" value={d.caption || ""} onChange={e => onChange({ ...d, caption: e.target.value })} style={{ fontSize: "0.82rem" }} />
      </div>
      {showPicker && (
        <GalleryPickerModal
          multi={false}
          onSelect={items => { if (items[0]) onChange({ ...d, src: items[0].imageUrl, alt: d.alt || items[0].title }); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

/* ─── VIDEO ──────────────────────────────────── */
function VideoBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const d = block.data;
  const url = d.url || "";
  const embedUrl = url ? getVideoEmbedUrl(url) : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={LBL}>URL Video (YouTube / Vimeo / Embed)</label>
        <input className="dash-input" type="text" value={url} onChange={e => onChange({ ...d, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=... atau embed URL" style={{ fontSize: "0.85rem" }} />
      </div>
      <div>
        <label style={LBL}>Judul Video (Opsional)</label>
        <input className="dash-input" type="text" value={d.title || ""} onChange={e => onChange({ ...d, title: e.target.value })} placeholder="Judul atau deskripsi video" style={{ fontSize: "0.85rem" }} />
      </div>
      {embedUrl ? (
        <div>
          <label style={LBL}>Preview Video</label>
          <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "12px", overflow: "hidden", background: "#000" }}>
            <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen title={d.title || "Video"} />
          </div>
        </div>
      ) : (
        <div style={{ border: "2px dashed var(--dash-border)", borderRadius: "10px", padding: "2.5rem 1rem", textAlign: "center", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)" }}>
          <Video size={30} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Masukkan URL video di atas</p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", opacity: 0.7 }}>YouTube · Vimeo · URL embed langsung</p>
        </div>
      )}
    </div>
  );
}

/* ─── GALLERY ────────────────────────────────── */
function GalleryBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const d = block.data;
  return (
    <GalleryWidget
      selectedIds={d.selectedIds || []}
      onChange={ids => onChange({ ...d, selectedIds: ids })}
      caption={d.caption || ""}
      onCaptionChange={caption => onChange({ ...d, caption })}
    />
  );
}

/* ─── CAROUSEL ───────────────────────────────── */
interface Slide { id: string; src: string; title: string; subtitle: string; }

function CarouselBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [canDrag, setCanDrag] = useState(false);
  const d = block.data;
  const slides: Slide[] = d.slides || [];
  const cols: number = d.cols || 1;

  const reorder = (from: number, to: number) => {
    const next = [...slides]; const [item] = next.splice(from, 1); next.splice(to, 0, item);
    onChange({ ...d, slides: next });
  };
  const updateSlide = (idx: number, patch: Partial<Slide>) => {
    onChange({ ...d, slides: slides.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.65rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ ...LBL, marginBottom: 0 }}>Tampil per baris:</label>
          {[1, 2, 3].map(c => (
            <button key={c} type="button" onClick={() => onChange({ ...d, cols: c })} style={{ padding: "0.28rem 0.65rem", borderRadius: "8px", border: "1px solid var(--dash-border)", background: cols === c ? "var(--dash-text)" : "transparent", color: cols === c ? "#fff" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, transition: "all 0.15s" }}>1×{c}</button>
          ))}
        </div>
        <button type="button" onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.38rem 0.8rem", borderRadius: "8px", border: "1px solid var(--dash-primary)", background: "var(--dash-primary-bg)", color: "var(--dash-primary)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>
          <Plus size={13} /> Tambah Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div onClick={() => setShowPicker(true)} style={{ border: "2px dashed var(--dash-border)", borderRadius: "10px", padding: "2.5rem 1rem", textAlign: "center", cursor: "pointer", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)", transition: "all 0.15s" }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-primary)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border)"; }}>
          <Sliders size={28} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>Klik untuk menambahkan slide carousel</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          {slides.map((slide, si) => (
            <div key={slide.id + si}
              draggable={canDrag}
              onDragStart={() => setDraggedIdx(si)}
              onDragOver={e => { e.preventDefault(); if (draggedIdx !== null && draggedIdx !== si) { reorder(draggedIdx, si); setDraggedIdx(si); } }}
              onDragEnd={() => { setDraggedIdx(null); setCanDrag(false); }}
              style={{ display: "flex", gap: "0.65rem", padding: "0.75rem", background: "var(--dash-surface-hover)", border: `1px solid ${draggedIdx === si ? "var(--dash-primary)" : "var(--dash-border)"}`, borderRadius: "10px", alignItems: "center", opacity: draggedIdx === si ? 0.4 : 1, transition: "opacity 0.15s, border-color 0.15s" }}>
              <div onMouseDown={() => setCanDrag(true)} onMouseUp={() => setCanDrag(false)} style={{ cursor: "grab", color: "var(--dash-text-muted)", flexShrink: 0, display: "flex", userSelect: "none" }}>
                <GripVertical size={15} />
              </div>
              <img src={slide.src} alt={slide.title} style={{ width: "72px", aspectRatio: "16/9", objectFit: "cover", borderRadius: "7px", border: "1px solid var(--dash-border)", flexShrink: 0, userSelect: "none" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: 0 }}>
                <input type="text" value={slide.title} onChange={e => updateSlide(si, { title: e.target.value })} placeholder="Judul Slide"
                  style={{ ...INPUT, fontWeight: 700 }} />
                <input type="text" value={slide.subtitle} onChange={e => updateSlide(si, { subtitle: e.target.value })} placeholder="Sub-judul Slide"
                  style={{ ...INPUT, fontSize: "0.78rem", color: "var(--dash-text-muted)", borderBottomColor: "transparent" }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--dash-border)")}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = "transparent")} />
              </div>
              <button type="button" onClick={() => onChange({ ...d, slides: slides.filter((_, i) => i !== si) })} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.25rem", flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showPicker && (
        <GalleryPickerModal
          multi={true}
          selectedIds={slides.map(s => s.id)}
          onSelect={picked => {
            const existing = new Set(slides.map(s => s.id));
            const add: Slide[] = picked
              .filter(it => !existing.has(it.id))
              .map(it => ({ id: it.id, src: it.imageUrl, title: it.title, subtitle: "" }));
            onChange({ ...d, slides: [...slides, ...add] });
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

/* ─── GRID ───────────────────────────────────── */
interface GridCol { image?: string; title: string; text: string; }

function GridBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const [showLibIdx, setShowLibIdx] = useState<number | null>(null);
  const d = block.data;
  const numCols: number = d.cols || 2;
  const columns: GridCol[] = d.columns
    ? d.columns
    : Array(numCols).fill(null).map(() => ({ title: "", text: "" }));

  const setColumns = (cols: GridCol[]) => onChange({ ...d, columns: cols });
  const updateCol = (i: number, patch: Partial<GridCol>) => {
    setColumns(columns.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  };
  const changeCols = (n: number) => {
    const next: GridCol[] = Array(n).fill(null).map((_, i) => columns[i] || { title: "", text: "" });
    onChange({ ...d, cols: n, columns: next });
  };
  const gridTpl = numCols >= 3 ? "repeat(3,1fr)" : numCols === 2 ? "repeat(2,1fr)" : "1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label style={{ ...LBL, marginBottom: 0 }}>Kolom:</label>
        {[1, 2, 3, 4].map(c => (
          <button key={c} type="button" onClick={() => changeCols(c)} style={{ padding: "0.28rem 0.6rem", borderRadius: "8px", border: "1px solid var(--dash-border)", background: numCols === c ? "var(--dash-text)" : "transparent", color: numCols === c ? "#fff" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, transition: "all 0.15s" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: gridTpl, gap: "0.75rem" }}>
        {columns.slice(0, numCols).map((col, ci) => (
          <div key={ci} style={{ position: "relative", padding: "0.85rem", background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {numCols > 1 && (
              <button type="button" onClick={() => changeCols(numCols - 1)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.15rem" }}>
                <Trash2 size={13} />
              </button>
            )}
            {col.image ? (
              <div style={{ position: "relative" }}>
                <img src={col.image} alt={col.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--dash-border)", display: "block" }} />
                <div className="col-img-overlay" style={{ position: "absolute", inset: 0, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: 0, background: "rgba(0,0,0,0)", transition: "all 0.2s" }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"; }}>
                  <button type="button" onClick={() => setShowLibIdx(ci)} style={{ padding: "0.3rem 0.6rem", borderRadius: "6px", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" }}>Ganti</button>
                  <button type="button" onClick={() => updateCol(ci, { image: undefined })} style={{ padding: "0.3rem 0.6rem", borderRadius: "6px", background: "rgba(220,38,38,0.75)", border: "none", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Hapus</button>
                </div>
              </div>
            ) : (
              <div onClick={() => setShowLibIdx(ci)} style={{ width: "100%", aspectRatio: "16/9", border: "2px dashed var(--dash-border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dash-text-muted)", transition: "all 0.15s" }}
                onMouseOver={e => { const el = e.currentTarget; el.style.borderColor = "var(--dash-primary)"; el.style.background = "var(--dash-primary-bg)"; el.style.color = "var(--dash-primary)"; }}
                onMouseOut={e => { const el = e.currentTarget; el.style.borderColor = "var(--dash-border)"; el.style.background = "transparent"; el.style.color = "var(--dash-text-muted)"; }}>
                <Image size={18} style={{ marginBottom: "0.2rem" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Tambah Gambar</span>
              </div>
            )}
            <input type="text" value={col.title} onChange={e => updateCol(ci, { title: e.target.value })} placeholder="Judul kolom"
              style={{ ...INPUT, fontWeight: 700, width: numCols > 1 ? "calc(100% - 1.5rem)" : "100%" }} />
            <textarea value={col.text} onChange={e => updateCol(ci, { text: e.target.value })} rows={3} placeholder="Tulis isi konten kolom..."
              style={{ width: "100%", fontSize: "0.8rem", color: "var(--dash-text-soft)", background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.5rem 0.65rem", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.55 }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--dash-primary)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--dash-border)")} />
          </div>
        ))}
      </div>
      {showLibIdx !== null && (
        <GalleryPickerModal
          multi={false}
          onSelect={items => { if (items[0]) updateCol(showLibIdx!, { image: items[0].imageUrl }); }}
          onClose={() => setShowLibIdx(null)}
        />
      )}
    </div>
  );
}

/* ─── HTML ───────────────────────────────────── */
function HTMLBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const [preview, setPreview] = useState(false);
  const d = block.data;
  const code = d.code || d.content || "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={LBL}>Kode HTML / CSS / JS Embed</label>
        <button type="button" onClick={() => setPreview(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.7rem", borderRadius: "7px", border: "1px solid var(--dash-border)", background: preview ? "var(--dash-primary)" : "transparent", color: preview ? "#fff" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>
          <Monitor size={12} /> {preview ? "Sembunyikan" : "Live Preview"}
        </button>
      </div>
      <textarea rows={8} value={code} onChange={e => onChange({ ...d, code: e.target.value, content: undefined })}
        placeholder={"<style>\n  .box { color: blue; }\n</style>\n<div class='box'>Hello World</div>\n<script>\n  console.log('ok');\n</script>"}
        style={{ width: "100%", background: "#0f172a", border: "1px solid var(--dash-border)", borderRadius: "10px", color: "#34d399", padding: "0.85rem 1rem", fontFamily: "monospace", fontSize: "0.8rem", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }} />
      {preview && code && (
        <div style={{ border: "1px solid var(--dash-border)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "0.4rem 0.75rem", background: "var(--dash-surface-hover)", borderBottom: "1px solid var(--dash-border)", fontSize: "0.7rem", color: "var(--dash-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Monitor size={11} /> Live Preview Render
          </div>
          <iframe srcDoc={code} style={{ width: "100%", minHeight: "250px", border: "none", display: "block", background: "#fff" }} sandbox="allow-scripts allow-same-origin" title="HTML Preview" />
        </div>
      )}
    </div>
  );
}

/* ─── Legacy YouTube ─────────────────────────── */
function LegacyYouTubeBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  return <VideoBlock block={{ ...block, type: "video" }} onChange={onChange} />;
}

/* ─── Legacy iFrame ──────────────────────────── */
function LegacyIframeBlock({ block, onChange }: { block: Block; onChange: (d: any) => void }) {
  const d = block.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input className="dash-input" placeholder="URL iframe (https://...)" value={d.src || ""} onChange={e => onChange({ ...d, src: e.target.value })} style={{ flex: 1, fontSize: "0.85rem" }} />
        <div>
          <input type="number" className="dash-input" value={d.height || 400} onChange={e => onChange({ ...d, height: parseInt(e.target.value) })} style={{ width: "90px", fontSize: "0.82rem" }} />
        </div>
      </div>
      {d.src
        ? <iframe src={d.src} title={d.title || "Embed"} style={{ width: "100%", height: d.height || 400, border: "1px solid var(--dash-border)", borderRadius: "8px", display: "block" }} />
        : <div style={{ border: "2px dashed var(--dash-border)", borderRadius: "8px", padding: "2rem 1rem", textAlign: "center", color: "var(--dash-text-muted)", background: "var(--dash-surface-hover)" }}>
            <ExternalLink size={26} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "0.85rem" }}>Masukkan URL untuk embed iframe</p>
          </div>
      }
    </div>
  );
}

/* ─── Block metadata ─────────────────────────── */
const BLOCK_META: Record<string, { label: string; color: string }> = {
  text:     { label: "Teks Kaya",      color: "var(--dash-primary)" },
  image:    { label: "Gambar",          color: "#8b5cf6" },
  video:    { label: "Video",           color: "#ef4444" },
  gallery:  { label: "Galeri",          color: "#f59e0b" },
  carousel: { label: "Carousel",        color: "#06b6d4" },
  grid:     { label: "Grid",            color: "#84cc16" },
  html:     { label: "HTML / JS / CSS", color: "#ec4899" },
  youtube:  { label: "Video YouTube",   color: "#ef4444" },
  iframe:   { label: "iFrame",          color: "#6b7280" },
};

/* ─── Sortable Block Wrapper ─────────────────── */
function SortableBlock({ block, onUpdate, onDelete, onDuplicate, isFirst, isLast, onMoveUp, onMoveDown }: {
  block: Block; onUpdate: (d: any) => void; onDelete: () => void;
  onDuplicate: () => void; isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };
  const meta = BLOCK_META[block.type] || { label: block.type, color: "var(--dash-text-muted)" };

  return (
    <div ref={setNodeRef} style={{ ...style, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
      {/* Outer drag handle */}
      <div {...attributes} {...listeners} style={{ cursor: "grab", color: "var(--dash-text-muted)", paddingTop: "0.7rem", flexShrink: 0, touchAction: "none" }}>
        <GripVertical size={15} />
      </div>

      {/* Block card — always light, uses card tokens */}
      <div style={{ flex: 1, background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

        {/* Top toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 0.85rem", background: "var(--dash-surface-hover)", borderBottom: "1px solid var(--dash-border)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "0.15rem 0.55rem", borderRadius: "5px", fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
            {meta.label}
          </span>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onMoveUp} disabled={isFirst} style={{ background: "none", border: "none", color: isFirst ? "var(--dash-border)" : "var(--dash-text-muted)", cursor: isFirst ? "not-allowed" : "pointer", padding: "0.2rem" }}><ChevronUp size={14} /></button>
          <button type="button" onClick={onMoveDown} disabled={isLast} style={{ background: "none", border: "none", color: isLast ? "var(--dash-border)" : "var(--dash-text-muted)", cursor: isLast ? "not-allowed" : "pointer", padding: "0.2rem" }}><ChevronDown size={14} /></button>
          <button type="button" onClick={onDuplicate} title="Duplikat" style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "0.2rem" }}><Copy size={14} /></button>
          <button type="button" onClick={onDelete} title="Hapus" style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.2rem" }}><Trash2 size={14} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "1rem 1.1rem" }}>
          {block.type === "text"     && <TextBlock     block={block} onChange={onUpdate} />}
          {block.type === "image"    && <ImageBlock    block={block} onChange={onUpdate} />}
          {block.type === "video"    && <VideoBlock    block={block} onChange={onUpdate} />}
          {block.type === "gallery"  && <GalleryBlock  block={block} onChange={onUpdate} />}
          {block.type === "carousel" && <CarouselBlock block={block} onChange={onUpdate} />}
          {block.type === "grid"     && <GridBlock     block={block} onChange={onUpdate} />}
          {block.type === "html"     && <HTMLBlock     block={block} onChange={onUpdate} />}
          {block.type === "youtube"  && <LegacyYouTubeBlock block={block} onChange={onUpdate} />}
          {block.type === "iframe"   && <LegacyIframeBlock  block={block} onChange={onUpdate} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Widget Button Bar ──────────────────── */
const WIDGET_BTN = [
  { type: "text",     icon: <Type size={20} />,      label: "Teks"     },
  { type: "gallery",  icon: <Images size={20} />,    label: "Galeri"   },
  { type: "video",    icon: <Video size={20} />,     label: "Video"    },
  { type: "carousel", icon: <Sliders size={20} />,   label: "Carousel" },
  { type: "grid",     icon: <LayoutGrid size={20} />, label: "Grid"    },
  { type: "html",     icon: <Code2 size={20} />,     label: "HTML"     },
] as const;

function AddWidgetBar({ onAdd }: { onAdd: (t: BlockType) => void }) {
  return (
    <div style={{ border: "1px solid var(--dash-border)", borderRadius: "20px", padding: "1.1rem 1.25rem", background: "var(--dash-card)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <p style={{ margin: "0 0 0.85rem", fontSize: "0.62rem", fontWeight: 800, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
        Tambah Blok Widget
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "0.55rem" }}>
        {WIDGET_BTN.map(({ type, icon, label }) => (
          <button key={type} type="button" onClick={() => onAdd(type as BlockType)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", padding: "0.85rem 0.4rem", borderRadius: "12px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, transition: "all 0.15s" }}
            onMouseOver={e => { const el = e.currentTarget; el.style.borderColor = "var(--dash-primary)"; el.style.background = "var(--dash-primary-bg)"; el.style.color = "var(--dash-primary)"; }}
            onMouseOut={e => { const el = e.currentTarget; el.style.borderColor = "var(--dash-border)"; el.style.background = "var(--dash-surface-hover)"; el.style.color = "var(--dash-text-soft)"; }}>
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Export ────────────────────────────── */
export default function BlockEditor({ value, onChange }: { value: Block[]; onChange: (blocks: Block[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addBlock = (type: BlockType) => onChange([...value, { id: genId(), type, data: {} }]);
  const updateBlock = (id: string, data: any) => onChange(value.map(b => b.id === id ? { ...b, data } : b));
  const deleteBlock = (id: string) => onChange(value.filter(b => b.id !== id));
  const duplicateBlock = (id: string) => {
    const idx = value.findIndex(b => b.id === id);
    if (idx === -1) return;
    const next = [...value]; next.splice(idx + 1, 0, { ...value[idx], id: genId() });
    onChange(next);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id)
      onChange(arrayMove(value, value.findIndex(b => b.id === active.id), value.findIndex(b => b.id === over.id)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {value.map((block, idx) => (
            <SortableBlock key={block.id} block={block}
              onUpdate={data => updateBlock(block.id, data)}
              onDelete={() => deleteBlock(block.id)}
              onDuplicate={() => duplicateBlock(block.id)}
              isFirst={idx === 0} isLast={idx === value.length - 1}
              onMoveUp={() => idx > 0 && onChange(arrayMove(value, idx, idx - 1))}
              onMoveDown={() => idx < value.length - 1 && onChange(arrayMove(value, idx, idx + 1))}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddWidgetBar onAdd={addBlock} />
    </div>
  );
}
