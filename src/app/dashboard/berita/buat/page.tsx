"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Save, Send, ArrowLeft, Image, Tag, Search, FileText, Eye, Loader2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import MediaLibrary, { MediaItem } from "@/components/admin/MediaLibrary";
import { type Block } from "@/components/admin/BlockEditor";

const BlockEditor = dynamic(() => import("@/components/admin/BlockEditor"), { ssr: false, loading: () => (
  <div style={{ padding: "2rem", textAlign: "center", color: "var(--dash-text-muted)" }}>
    <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "0.5rem" }} />
    <p style={{ margin: 0, fontSize: "0.85rem" }}>Memuat editor...</p>
  </div>
) });

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
  const [showLib, setShowLib] = useState(false);
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
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed)) { setBlocks(parsed); return; }
          } catch {}
          // Legacy plain text content → wrap in text block
          if (data.content) {
            setBlocks([{ id: "blk_legacy", type: "text", data: { html: `<p>${data.content}</p>` } }]);
          }
        }
      }).catch(() => {});
    }
  }, [editId]);

  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!tagInput.trim()) return;
      const next = [...tagList, tagInput.trim()].join(", ");
      setTags(next);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tagList.filter(t => t !== tag).join(", "));
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

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/dashboard/berita" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--dash-text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "white", flex: 1 }}>
          {editId ? "Edit Artikel" : "Buat Artikel Baru"}
        </h1>
        {saveMsg && <span style={{ fontSize: "0.8rem", color: "var(--dash-success)", fontWeight: 700 }}>{saveMsg}</span>}
        <button onClick={() => handleSave("draft")} disabled={saving} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
          <Save size={15} /> {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>
        <button onClick={() => handleSave("published")} disabled={saving} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
          <Send size={15} /> Terbitkan
        </button>
      </div>

      {/* Main Layout: Left Canvas | Right Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", flex: 1, alignItems: "start" }} className="wp-editor-grid">
        {/* LEFT: Content Canvas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Title */}
          <div className="dash-card" style={{ padding: "1.25rem 1.5rem" }}>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Judul artikel..."
              style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: "white", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", boxSizing: "border-box" }}
            />
          </div>

          {/* Block Canvas */}
          <div className="dash-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--dash-border)" }}>
              <FileText size={16} style={{ color: "var(--dash-primary)" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Konten Artikel</span>
            </div>
            <BlockEditor value={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1.5rem" }}>
          {/* Publish */}
          <div className="dash-card" style={{ padding: "1.25rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Publikasi</p>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["draft", "published"] as const).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)} style={{ flex: 1, padding: "0.45rem", borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: status === s ? (s === "published" ? "var(--dash-success)" : "var(--dash-border-2)") : "transparent", color: status === s ? "white" : "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize" }}>
                  {s === "published" ? "Terbit" : "Draft"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button onClick={() => handleSave("draft")} disabled={saving} className="dash-btn" style={{ backgroundColor: "transparent", border: "1px solid var(--dash-border)", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Save size={14} /> Simpan Draft
              </button>
              <button onClick={() => handleSave("published")} disabled={saving} className="dash-btn" style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Send size={14} /> Terbitkan Sekarang
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="dash-card" style={{ padding: "1.25rem" }}>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gambar Thumbnail</p>
            {thumbnail ? (
              <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <img src={thumbnail} alt="" style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
                <button onClick={() => setThumbnail("")} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>✕</button>
              </div>
            ) : null}
            <button type="button" onClick={() => setShowLib(true)} className="dash-btn" style={{ width: "100%", backgroundColor: "transparent", border: "1px solid var(--dash-border)", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <Image size={14} /> {thumbnail ? "Ganti Thumbnail" : "Pilih Thumbnail"}
            </button>
            <div style={{ marginTop: "0.5rem" }}>
              <input className="dash-input" placeholder="atau masukkan URL gambar..." value={thumbnail} onChange={e => setThumbnail(e.target.value)} style={{ fontSize: "0.78rem", padding: "0.4rem 0.6rem" }} />
            </div>
          </div>

          {/* Tags */}
          <div className="dash-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
              <Tag size={14} style={{ color: "var(--dash-primary)" }} />
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kategori & Tag</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.5rem" }}>
              {tagList.map(t => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.6rem", borderRadius: "999px", backgroundColor: "rgba(99,102,241,0.15)", color: "var(--dash-primary)", fontSize: "0.72rem", fontWeight: 700 }}>
                  {t}
                  <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "0.9rem" }}>×</button>
                </span>
              ))}
            </div>
            <input className="dash-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Tambah tag, tekan Enter..." style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }} />
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.7rem", color: "var(--dash-text-muted)" }}>Tekan Enter atau koma untuk menambah tag</p>
          </div>

          {/* SEO */}
          <div className="dash-card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
              <Search size={14} style={{ color: "var(--dash-primary)" }} />
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>SEO</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Meta Title</label>
                <input className="dash-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title || "Meta title..."} style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Meta Description</label>
                <textarea className="dash-input" rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Deskripsi singkat untuk mesin pencari..." style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem", resize: "vertical" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLib && <MediaLibrary onSelect={(item: MediaItem) => { setThumbnail(item.src); setShowLib(false); }} onClose={() => setShowLib(false)} />}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .wp-editor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
