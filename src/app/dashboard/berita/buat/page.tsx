"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Save, Send, ArrowLeft, Image, Tag, Search, FileText, CalendarDays, UploadCloud, Folder, Loader2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import MediaLibrary, { MediaItem } from "@/components/admin/MediaLibrary";
import { type Block } from "@/components/admin/BlockEditor";

const BlockEditor = dynamic(() => import("@/components/admin/BlockEditor"), { ssr: false, loading: () => (
  <div style={{ padding: "3rem", textAlign: "center", color: "var(--dash-text-muted)" }}>
    <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "0.75rem", display: "inline" }} />
    <p style={{ margin: 0, fontSize: "0.85rem" }}>Memuat editor teks...</p>
  </div>
) });

const CATEGORIES = ["Pariwisata", "Event & Festival", "Budaya", "Ekonomi Kreatif", "Olahraga", "Kepemudaan", "Pengumuman"];

const fileToDataUrl = (file: File) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(file);
});

export default function BuatBeritaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useAdmin();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState("Pariwisata");
  const [tagInput, setTagInput] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [showLib, setShowLib] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (editId) {
      fetch(`/api/posts/${editId}`).then(r => r.json()).then(data => {
        if (data.id) {
          setTitle(data.title || "");
          setStatus(data.status || "draft");
          setTags(data.tags || "Pariwisata");
          setThumbnail(data.imageUrl || "");
          setSeoTitle(data.seoTitle || "");
          setSeoDesc(data.seoDesc || "");
          setPublishDate(data.publishDate || "");
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed)) { setBlocks(parsed); return; }
          } catch {}
          if (data.content) {
            setBlocks([{ id: "blk_legacy", type: "text", data: { html: `<p>${data.content}</p>` } }]);
          }
        }
      }).catch(console.error);
    }
  }, [editId]);

  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
  const primaryCategory = tagList[0] || "";

  const setPrimaryCategory = (cat: string) => {
    const rest = tagList.slice(1).filter(t => t !== cat);
    setTags([cat, ...rest].join(", "));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!tagInput.trim()) return;
      if (tagList.includes(tagInput.trim())) { setTagInput(""); return; }
      const next = [...tagList, tagInput.trim()].join(", ");
      setTags(next);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tagList.filter(t => t !== tag).join(", "));
  };

  const handleThumbFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setThumbnail(await fileToDataUrl(file));
  };

  const handleSave = async (overrideStatus?: "draft" | "published") => {
    if (!title.trim()) { alert("Judul artikel wajib diisi."); return; }
    setSaving(true);
    const payload = {
      title: title.trim(),
      content: JSON.stringify(blocks),
      imageUrl: thumbnail,
      status: overrideStatus || status,
      tags,
      seoTitle: seoTitle || title,
      seoDesc,
      publishDate,
      authorId: user?.id,
    };
    try {
      const url = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setSaveMsg(overrideStatus === "published" ? "Artikel diterbitkan!" : "Draft disimpan!");
      setTimeout(() => setSaveMsg(""), 3000);
      if (!editId) router.replace(`/dashboard/berita/buat?id=${data.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sectionLabel = (icon: React.ReactNode, text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      {icon}
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{text}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Top Bar Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/berita" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", borderRadius: "10px", border: "1px solid var(--dash-border)", color: "var(--dash-text-soft)", textDecoration: "none", transition: "all 0.2s", flexShrink: 0 }}
            onMouseOver={e => { e.currentTarget.style.color = "var(--dash-text)"; e.currentTarget.style.borderColor = "var(--dash-border-2)"; }}
            onMouseOut={e => { e.currentTarget.style.color = "var(--dash-text-soft)"; e.currentTarget.style.borderColor = "var(--dash-border)"; }}>
            <ArrowLeft size={17} />
          </Link>
          <div>
            <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Editor Artikel</p>
            <h1 style={{ margin: "1px 0 0", fontSize: "1.2rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.01em" }}>
              {editId ? "Edit Berita" : "Tulis Berita Baru"}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
          {saveMsg && <span style={{ fontSize: "0.8rem", color: "var(--dash-success)", fontWeight: 700, marginRight: "0.25rem" }}>{saveMsg}</span>}
          <button onClick={() => handleSave("draft")} disabled={saving} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", fontSize: "0.82rem", boxShadow: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Save size={15} /> {saving ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button onClick={() => handleSave("published")} disabled={saving} className="dash-btn" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Send size={15} /> Terbitkan
          </button>
        </div>
      </div>

      {/* Main Grid: Canvas | Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }} className="wp-editor-grid">

        {/* LEFT CANVAS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>

          {/* Title */}
          <div className="dash-card" style={{ padding: "1.5rem 1.75rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Judul</p>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tulis judul yang menarik di sini..."
              style={{
                width: "100%", border: "none", outline: "none", background: "transparent",
                color: "var(--dash-text)", fontSize: "1.85rem", fontWeight: 800,
                letterSpacing: "-0.02em", lineHeight: 1.25, boxSizing: "border-box"
              }}
            />
          </div>

          {/* Block Editor Canvas */}
          <div className="dash-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--dash-border)" }}>
              <FileText size={16} style={{ color: "var(--dash-primary)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Konten Artikel</span>
            </div>
            <BlockEditor value={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* RIGHT STICKY SIDEBAR */}
        <div className="wp-editor-aside" style={{ display: "flex", flexDirection: "column", gap: "1.1rem", position: "sticky", top: "1rem" }}>

          {/* Publish & schedule */}
          <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {sectionLabel(<Send size={14} style={{ color: "var(--dash-primary)" }} />, "Publikasi")}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["draft", "published"] as const).map(s => {
                const active = status === s;
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    style={{ flex: 1, padding: "0.55rem 0.25rem", borderRadius: "8px", border: "1px solid",
                      borderColor: active ? (s === "published" ? "var(--dash-success)" : "var(--dash-primary)") : "var(--dash-border)",
                      backgroundColor: active ? (s === "published" ? "var(--dash-success-bg)" : "var(--dash-primary-bg)") : "transparent",
                      color: active ? (s === "published" ? "var(--dash-success)" : "var(--dash-primary)") : "var(--dash-text-muted)",
                      cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.2s" }}>
                    {s === "published" ? "Terbit" : "Draft"}
                  </button>
                );
              })}
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, marginBottom: "0.35rem" }}>
                <CalendarDays size={13} /> Tanggal Publikasi
              </label>
              <input type="date" className="dash-input" value={publishDate} onChange={e => setPublishDate(e.target.value)} style={{ fontSize: "0.78rem", padding: "0.45rem 0.65rem", colorScheme: "light dark" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--dash-border)", paddingTop: "0.85rem" }}>
              <button onClick={() => handleSave("draft")} disabled={saving} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", boxShadow: "none" }}>
                <Save size={14} /> Simpan Draft
              </button>
              <button onClick={() => handleSave("published")} disabled={saving} className="dash-btn" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Send size={14} /> Terbitkan Sekarang
              </button>
            </div>
          </div>

          {/* Thumbnail with drag-drop */}
          <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {sectionLabel(<Image size={14} style={{ color: "var(--dash-primary)" }} />, "Gambar Utama")}
            {thumbnail ? (
              <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                <img src={thumbnail} alt="" style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
                <button onClick={() => setThumbnail("")} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "var(--dash-surface)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dash-danger)", border: "1px solid var(--dash-border)" }}>✕</button>
              </div>
            ) : (
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleThumbFile(e.dataTransfer.files?.[0]); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "1.6rem 1rem", borderRadius: "10px", cursor: "pointer", textAlign: "center",
                  border: `1.5px dashed ${dragOver ? "var(--dash-primary)" : "var(--dash-border-2)"}`,
                  backgroundColor: dragOver ? "var(--dash-primary-bg)" : "transparent", transition: "all 0.2s"
                }}>
                <UploadCloud size={24} style={{ color: "var(--dash-primary)" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text)" }}>Seret & lepas gambar</span>
                <span style={{ fontSize: "0.68rem", color: "var(--dash-text-muted)" }}>atau klik untuk pilih file</span>
                <input type="file" accept="image/*" onChange={e => handleThumbFile(e.target.files?.[0])} style={{ display: "none" }} />
              </label>
            )}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={() => setShowLib(true)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", boxShadow: "none" }}>
                <Image size={13} /> Pustaka Media
              </button>
            </div>
            <input className="dash-input" placeholder="atau paste URL gambar..." value={thumbnail} onChange={e => setThumbnail(e.target.value)} style={{ fontSize: "0.76rem", padding: "0.45rem 0.65rem" }} />
          </div>

          {/* Category + Tags */}
          <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {sectionLabel(<Folder size={14} style={{ color: "var(--dash-primary)" }} />, "Kategori & Tag")}
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>Kategori Utama</label>
              <select className="dash-input" value={CATEGORIES.includes(primaryCategory) ? primaryCategory : ""} onChange={e => setPrimaryCategory(e.target.value)} style={{ fontSize: "0.78rem", padding: "0.5rem 0.65rem", cursor: "pointer" }}>
                <option value="" disabled>Pilih kategori...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.55rem" }}>
                <Tag size={13} style={{ color: "var(--dash-text-muted)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Tag Tambahan</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: tagList.length ? "0.55rem" : 0 }}>
                {tagList.map((t, i) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem", borderRadius: "999px", backgroundColor: i === 0 ? "var(--dash-primary)" : "var(--dash-primary-bg)", color: i === 0 ? "#fff" : "var(--dash-primary)", fontSize: "0.72rem", fontWeight: 600 }}>
                    {t}
                    <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "0.95rem", marginLeft: "2px" }}>×</button>
                  </span>
                ))}
              </div>
              <input className="dash-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Tulis tag, tekan Enter..." style={{ fontSize: "0.76rem", padding: "0.45rem 0.65rem" }} />
            </div>
          </div>

          {/* SEO + Google preview */}
          <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {sectionLabel(<Search size={14} style={{ color: "var(--dash-primary)" }} />, "Optimasi SEO")}

            {/* Google-style preview */}
            <div style={{ border: "1px solid var(--dash-border)", borderRadius: "10px", padding: "0.85rem 0.95rem", backgroundColor: "var(--dash-surface-hover)" }}>
              <p style={{ margin: 0, fontSize: "0.66rem", color: "var(--dash-text-muted)" }}>simad-lamtim.go.id › berita</p>
              <p style={{ margin: "2px 0 1px", fontSize: "0.92rem", fontWeight: 600, color: "#1a73e8", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seoTitle || title || "Judul artikel akan tampil di sini"}</p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dash-text-soft)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{seoDesc || "Deskripsi ringkas artikel untuk cuplikan hasil pencarian Google."}</p>
            </div>

            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Meta Judul</label>
              <input className="dash-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || "Judul di hasil pencarian..."} style={{ fontSize: "0.76rem", padding: "0.45rem 0.65rem" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>Meta Deskripsi</label>
              <textarea className="dash-input" rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Deskripsi ringkas untuk cuplikan pencarian..." style={{ fontSize: "0.76rem", padding: "0.45rem 0.65rem", resize: "none" }} />
            </div>
          </div>

        </div>
      </div>

      {showLib && <MediaLibrary onSelect={(item: MediaItem) => { setThumbnail(item.src); setShowLib(false); }} onClose={() => setShowLib(false)} />}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .wp-editor-grid { grid-template-columns: 1fr !important; }
          .wp-editor-aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}
