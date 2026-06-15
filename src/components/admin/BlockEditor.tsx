"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Trash2, Copy, Bold, Italic, UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2,
  Image, PlayCircle, Code2, Columns, Monitor, ExternalLink, ChevronUp, ChevronDown,
  X, Check, LayoutGrid
} from "lucide-react";
import MediaLibrary, { MediaItem } from "./MediaLibrary";

/* ── Types ── */
export type BlockType = "text" | "image" | "carousel" | "grid" | "html" | "youtube" | "iframe";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

function genId() { return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

/* ── TipTap Text Block ── */
function TextBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis konten di sini..." }),
    ],
    content: block.data.html || "",
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML() }),
  });

  if (!editor) return null;

  const Btn = ({ action, active, title, children }: { action: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={action} title={title} style={{
      padding: "0.3rem 0.45rem", borderRadius: "6px", border: "none", cursor: "pointer",
      backgroundColor: active ? "rgba(99,102,241,0.2)" : "transparent",
      color: active ? "var(--dash-primary)" : "var(--dash-text-muted)",
    }}>{children}</button>
  );

  const addLink = () => {
    const url = window.prompt("URL link:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15rem", padding: "0.5rem", backgroundColor: "#0f172a", borderRadius: "8px 8px 0 0", borderBottom: "1px solid var(--dash-border)", alignItems: "center" }}>
        <select onChange={e => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: parseInt(v) as 1|2|3 }).run();
        }} defaultValue="p" style={{ fontSize: "0.75rem", backgroundColor: "var(--dash-card-2)", border: "1px solid var(--dash-border)", color: "white", borderRadius: "6px", padding: "0.2rem 0.4rem", marginRight: "0.25rem", cursor: "pointer" }}>
          <option value="p">Paragraf</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <div style={{ width: "1px", height: "20px", backgroundColor: "var(--dash-border)", margin: "0 0.25rem" }} />
        <Btn action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={14} /></Btn>
        <Btn action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={14} /></Btn>
        <Btn action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon size={14} /></Btn>
        <div style={{ width: "1px", height: "20px", backgroundColor: "var(--dash-border)", margin: "0 0.25rem" }} />
        <Btn action={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Rata Kiri"><AlignLeft size={14} /></Btn>
        <Btn action={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Rata Tengah"><AlignCenter size={14} /></Btn>
        <Btn action={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rata Kanan"><AlignRight size={14} /></Btn>
        <div style={{ width: "1px", height: "20px", backgroundColor: "var(--dash-border)", margin: "0 0.25rem" }} />
        <Btn action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Daftar Bullet"><List size={14} /></Btn>
        <Btn action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Daftar Angka"><ListOrdered size={14} /></Btn>
        <div style={{ width: "1px", height: "20px", backgroundColor: "var(--dash-border)", margin: "0 0.25rem" }} />
        <Btn action={addLink} active={editor.isActive("link")} title="Sisipkan Link"><Link2 size={14} /></Btn>
      </div>
      <div style={{ backgroundColor: "#1a2332", borderRadius: "0 0 8px 8px", minHeight: "120px" }}>
        <style>{`
          .tiptap-editor { padding: 0.85rem 1rem; min-height: 120px; outline: none; color: #e2e8f0; font-size: 0.9rem; line-height: 1.7; }
          .tiptap-editor p { margin: 0 0 0.5rem; } .tiptap-editor h1 { font-size: 1.6rem; font-weight: 800; margin: 0 0 0.5rem; color: white; }
          .tiptap-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; color: white; }
          .tiptap-editor h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.5rem; color: white; }
          .tiptap-editor ul, .tiptap-editor ol { padding-left: 1.5rem; margin: 0 0 0.5rem; }
          .tiptap-editor a { color: var(--dash-primary); text-decoration: underline; }
          .tiptap-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #4b5563; pointer-events: none; height: 0; }
        `}</style>
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}

/* ── Image Block ── */
function ImageBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const [showLib, setShowLib] = useState(false);
  const d = block.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {d.src ? (
        <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden" }}>
          <img src={d.src} alt={d.alt || ""} style={{ width: "100%", maxHeight: "320px", objectFit: "cover", display: "block", borderRadius: "8px" }} />
          <button onClick={() => onChange({ ...d, src: "" })} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}><X size={14} /></button>
        </div>
      ) : (
        <div onClick={() => setShowLib(true)} style={{ border: "2px dashed var(--dash-border)", borderRadius: "8px", padding: "2.5rem", textAlign: "center", cursor: "pointer", color: "var(--dash-text-muted)", backgroundColor: "var(--dash-card-2)" }}>
          <Image size={28} style={{ marginBottom: "0.5rem" }} />
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Klik untuk pilih gambar</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <input className="dash-input" placeholder="Alt text" value={d.alt || ""} onChange={e => onChange({ ...d, alt: e.target.value })} style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }} />
        <input className="dash-input" placeholder="Keterangan gambar" value={d.caption || ""} onChange={e => onChange({ ...d, caption: e.target.value })} style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }} />
      </div>
      <button type="button" onClick={() => setShowLib(true)} className="dash-btn" style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem", backgroundColor: "transparent", border: "1px solid var(--dash-border)", display: "flex", alignItems: "center", gap: "0.4rem", alignSelf: "flex-start" }}>
        <Image size={14} /> {d.src ? "Ganti Gambar" : "Pilih dari Library"}
      </button>
      {showLib && <MediaLibrary onSelect={item => { onChange({ ...d, src: item.src, alt: d.alt || item.alt }); setShowLib(false); }} onClose={() => setShowLib(false)} />}
    </div>
  );
}

/* ── Carousel Block ── */
function CarouselBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const [showLib, setShowLib] = useState(false);
  const d = block.data;
  const images: MediaItem[] = d.images || [];
  const cols: number = d.cols || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Layout:</span>
        {[1, 2, 3].map(c => (
          <button key={c} type="button" onClick={() => onChange({ ...d, cols: c })} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: cols === c ? "var(--dash-primary)" : "transparent", color: cols === c ? "white" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
            1×{c}
          </button>
        ))}
        <button type="button" onClick={() => setShowLib(true)} className="dash-btn" style={{ marginLeft: "auto", fontSize: "0.78rem", padding: "0.35rem 0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Plus size={13} /> Tambah Gambar
        </button>
      </div>
      {images.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cols, images.length)}, 1fr)`, gap: "0.5rem" }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: "relative", borderRadius: "6px", overflow: "hidden" }}>
              <img src={img.src} alt={img.alt || ""} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
              <button onClick={() => onChange({ ...d, images: images.filter((_, i) => i !== idx) })} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}><X size={12} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: "2px dashed var(--dash-border)", borderRadius: "8px", padding: "2rem", textAlign: "center", color: "var(--dash-text-muted)", backgroundColor: "var(--dash-card-2)" }}>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Belum ada gambar di carousel</p>
        </div>
      )}
      {showLib && <MediaLibrary multi onSelect={() => {}} onClose={() => setShowLib(false)} selected={images.map(i => i.id)} onMultiSelect={sel => { onChange({ ...d, images: [...images, ...sel.filter(s => !images.some(img => img.id === s.id))] }); setShowLib(false); }} />}
    </div>
  );
}

/* ── Grid Block ── */
function GridBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const d = block.data;
  const cols: number = d.cols || 2;
  const cells: string[] = d.cells || Array(cols).fill("");
  const [showLibIdx, setShowLibIdx] = useState<number | null>(null);

  const updateCell = (idx: number, val: string) => {
    const next = [...cells];
    next[idx] = val;
    onChange({ ...d, cells: next });
  };

  const changeCols = (n: number) => {
    const next = Array(n).fill("").map((_, i) => cells[i] || "");
    onChange({ ...d, cols: n, cells: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Kolom:</span>
        {[1, 2, 3, 4].map(c => (
          <button key={c} type="button" onClick={() => changeCols(c)} style={{ padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: cols === c ? "var(--dash-primary)" : "transparent", color: cols === c ? "white" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0.5rem" }}>
        {cells.map((cell, idx) => (
          <div key={idx} style={{ borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: "#1a2332", overflow: "hidden" }}>
            {cell ? (
              <div style={{ position: "relative" }}>
                {cell.startsWith("data:image") || cell.startsWith("http") ? (
                  <img src={cell} style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "#e2e8f0", minHeight: "80px", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: cell }} />
                )}
                <button onClick={() => updateCell(idx, "")} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}><X size={11} /></button>
              </div>
            ) : (
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <button type="button" onClick={() => setShowLibIdx(idx)} style={{ padding: "0.35rem", borderRadius: "6px", border: "1px dashed var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}><Image size={12} /> Gambar</button>
                <textarea placeholder="Teks / HTML..." rows={3} onChange={e => updateCell(idx, e.target.value)} style={{ fontSize: "0.75rem", backgroundColor: "#0f172a", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "#e2e8f0", padding: "0.35rem", outline: "none", resize: "none", width: "100%", boxSizing: "border-box" }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {showLibIdx !== null && <MediaLibrary onSelect={item => { updateCell(showLibIdx, item.src); setShowLibIdx(null); }} onClose={() => setShowLibIdx(null)} />}
    </div>
  );
}

/* ── HTML Block ── */
function HTMLBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const [preview, setPreview] = useState(false);
  const d = block.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>HTML / CSS / JS</span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => setPreview(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: "6px", border: "1px solid var(--dash-border)", background: preview ? "var(--dash-primary)" : "transparent", color: preview ? "white" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.75rem" }}>
          <Monitor size={13} /> {preview ? "Sembunyikan Preview" : "Lihat Preview"}
        </button>
      </div>
      <textarea rows={8} value={d.code || ""} onChange={e => onChange({ ...d, code: e.target.value })} placeholder="<!DOCTYPE html>&#10;<html>&#10;  <!-- kode HTML/CSS/JS kamu di sini -->" style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid var(--dash-border)", borderRadius: "8px", color: "#86efac", padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.82rem", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
      {preview && d.code && (
        <div style={{ border: "1px solid var(--dash-border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
          <div style={{ padding: "0.4rem 0.75rem", backgroundColor: "var(--dash-card-2)", borderBottom: "1px solid var(--dash-border)", fontSize: "0.72rem", color: "var(--dash-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}><Monitor size={12} /> Preview</div>
          <iframe srcDoc={d.code} style={{ width: "100%", height: "300px", border: "none", display: "block" }} sandbox="allow-scripts" title="HTML Preview" />
        </div>
      )}
    </div>
  );
}

/* ── YouTube Block ── */
function YouTubeBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const d = block.data;
  const getEmbedId = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]+)/);
    return m ? m[1] : null;
  };
  const embedId = d.url ? getEmbedId(d.url) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input className="dash-input" placeholder="URL YouTube (https://youtube.com/watch?v=...)" value={d.url || ""} onChange={e => onChange({ ...d, url: e.target.value })} style={{ flex: 1, fontSize: "0.85rem" }} />
        {d.url && <button type="button" onClick={() => onChange({ ...d, url: "" })} style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={16} /></button>}
      </div>
      <input className="dash-input" placeholder="Judul video (opsional)" value={d.title || ""} onChange={e => onChange({ ...d, title: e.target.value })} style={{ fontSize: "0.82rem" }} />
      {embedId ? (
        <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "8px", overflow: "hidden", backgroundColor: "#000" }}>
          <iframe src={`https://www.youtube.com/embed/${embedId}`} title={d.title || "YouTube"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      ) : (
        <div style={{ border: "2px dashed var(--dash-border)", borderRadius: "8px", padding: "2.5rem", textAlign: "center", color: "var(--dash-text-muted)", backgroundColor: "var(--dash-card-2)" }}>
          <PlayCircle size={32} style={{ marginBottom: "0.5rem" }} />
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Masukkan URL YouTube di atas</p>
        </div>
      )}
    </div>
  );
}

/* ── iFrame Block ── */
function IframeBlock({ block, onChange }: { block: Block; onChange: (data: any) => void }) {
  const d = block.data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <input className="dash-input" placeholder="URL iframe (https://...)" value={d.src || ""} onChange={e => onChange({ ...d, src: e.target.value })} style={{ fontSize: "0.85rem" }} />
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <label style={{ fontSize: "0.78rem", color: "var(--dash-text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>Tinggi (px):</label>
        <input type="number" className="dash-input" value={d.height || 400} onChange={e => onChange({ ...d, height: parseInt(e.target.value) })} style={{ width: "100px", fontSize: "0.82rem", padding: "0.4rem 0.6rem" }} />
        <input className="dash-input" placeholder="Judul iframe" value={d.title || ""} onChange={e => onChange({ ...d, title: e.target.value })} style={{ flex: 1, fontSize: "0.82rem" }} />
      </div>
      {d.src ? (
        <iframe src={d.src} title={d.title || "Embed"} style={{ width: "100%", height: d.height || 400, border: "1px solid var(--dash-border)", borderRadius: "8px", display: "block" }} />
      ) : (
        <div style={{ border: "2px dashed var(--dash-border)", borderRadius: "8px", padding: "2rem", textAlign: "center", color: "var(--dash-text-muted)", backgroundColor: "var(--dash-card-2)" }}>
          <ExternalLink size={28} style={{ marginBottom: "0.5rem" }} />
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Masukkan URL untuk embed iframe</p>
        </div>
      )}
    </div>
  );
}

/* ── Block Picker ── */
const BLOCK_TYPES = [
  { type: "text",     icon: <AlignLeft size={18} />,    label: "Teks Kaya",    desc: "Rich text dengan format" },
  { type: "image",    icon: <Image size={18} />,         label: "Gambar",       desc: "Upload atau dari gallery" },
  { type: "carousel", icon: <Columns size={18} />,       label: "Carousel",     desc: "Galeri foto 1×1 / 1×2 / 1×3" },
  { type: "grid",     icon: <LayoutGrid size={18} />,    label: "Grid",         desc: "Layout kolom drag & drop" },
  { type: "youtube",  icon: <PlayCircle size={18} />,    label: "Video YouTube",desc: "Embed video dari URL" },
  { type: "html",     icon: <Code2 size={18} />,         label: "HTML / CSS / JS", desc: "Kode dengan live preview" },
  { type: "iframe",   icon: <ExternalLink size={18} />,  label: "iFrame",       desc: "Embed halaman eksternal" },
] as const;

function BlockPicker({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div className="dash-card" style={{ width: "100%", maxWidth: "520px", padding: "1.5rem", backgroundColor: "var(--dash-card)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h4 style={{ margin: 0, color: "white", fontWeight: 800 }}>Tambah Blok</h4>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {BLOCK_TYPES.map(({ type, icon, label, desc }) => (
            <button key={type} type="button" onClick={() => { onAdd(type as BlockType); onClose(); }} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid var(--dash-border)", backgroundColor: "var(--dash-card-2)", cursor: "pointer", textAlign: "left" }}>
              <div style={{ color: "var(--dash-primary)", flexShrink: 0, marginTop: "0.1rem" }}>{icon}</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "white" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dash-text-muted)", marginTop: "0.15rem" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sortable Block Wrapper ── */
function SortableBlock({ block, onUpdate, onDelete, onDuplicate, isFirst, isLast, onMoveUp, onMoveDown }: {
  block: Block; onUpdate: (data: any) => void; onDelete: () => void; onDuplicate: () => void;
  isFirst: boolean; isLast: boolean; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const blockLabel = BLOCK_TYPES.find(b => b.type === block.type)?.label || block.type;

  return (
    <div ref={setNodeRef} style={{ ...style, display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
      {/* Drag handle */}
      <div {...attributes} {...listeners} style={{ cursor: "grab", color: "var(--dash-text-muted)", paddingTop: "0.65rem", flexShrink: 0, touchAction: "none" }}>
        <GripVertical size={16} />
      </div>
      {/* Block body */}
      <div style={{ flex: 1, backgroundColor: "#1a2332", borderRadius: "10px", border: "1px solid var(--dash-border)", overflow: "hidden" }}>
        <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--dash-border)" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dash-primary)" }}>{blockLabel}</span>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onMoveUp} disabled={isFirst} style={{ background: "none", border: "none", color: isFirst ? "var(--dash-border-2)" : "var(--dash-text-muted)", cursor: isFirst ? "not-allowed" : "pointer", padding: "0.2rem" }}><ChevronUp size={14} /></button>
          <button type="button" onClick={onMoveDown} disabled={isLast} style={{ background: "none", border: "none", color: isLast ? "var(--dash-border-2)" : "var(--dash-text-muted)", cursor: isLast ? "not-allowed" : "pointer", padding: "0.2rem" }}><ChevronDown size={14} /></button>
          <button type="button" onClick={onDuplicate} style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "0.2rem" }} title="Duplikat"><Copy size={14} /></button>
          <button type="button" onClick={onDelete} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.2rem" }} title="Hapus"><Trash2 size={14} /></button>
        </div>
        <div style={{ padding: "1rem" }}>
          {block.type === "text"     && <TextBlock block={block} onChange={onUpdate} />}
          {block.type === "image"    && <ImageBlock block={block} onChange={onUpdate} />}
          {block.type === "carousel" && <CarouselBlock block={block} onChange={onUpdate} />}
          {block.type === "grid"     && <GridBlock block={block} onChange={onUpdate} />}
          {block.type === "html"     && <HTMLBlock block={block} onChange={onUpdate} />}
          {block.type === "youtube"  && <YouTubeBlock block={block} onChange={onUpdate} />}
          {block.type === "iframe"   && <IframeBlock block={block} onChange={onUpdate} />}
        </div>
      </div>
    </div>
  );
}

/* ── Main BlockEditor Export ── */
export default function BlockEditor({ value, onChange }: { value: Block[]; onChange: (blocks: Block[]) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addBlock = (type: BlockType) => {
    const block: Block = { id: genId(), type, data: {} };
    onChange([...value, block]);
  };

  const updateBlock = (id: string, data: any) => {
    onChange(value.map(b => b.id === id ? { ...b, data } : b));
  };

  const deleteBlock = (id: string) => {
    onChange(value.filter(b => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const idx = value.findIndex(b => b.id === id);
    if (idx === -1) return;
    const copy = { ...value[idx], id: genId() };
    const next = [...value];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = value.findIndex(b => b.id === active.id);
      const newIdx = value.findIndex(b => b.id === over.id);
      onChange(arrayMove(value, oldIdx, newIdx));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {value.map((block, idx) => (
            <SortableBlock
              key={block.id} block={block}
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

      <button type="button" onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", borderRadius: "10px", border: "2px dashed var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s" }}
        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-primary)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-primary)"; }}
        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)"; }}>
        <Plus size={18} /> Tambah Blok Konten
      </button>

      {showPicker && <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
