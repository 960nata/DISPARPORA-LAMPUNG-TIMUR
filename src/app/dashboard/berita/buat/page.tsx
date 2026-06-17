"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Save, Send, ArrowLeft, Image, Tag, Search, FileText, CalendarDays,
  UploadCloud, Folder, Loader2, X, Plus, Hash, ExternalLink
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import MediaLibrary, { MediaItem } from "@/components/admin/MediaLibrary";
import { type Block } from "@/components/admin/BlockEditor";

const BlockEditor = dynamic(() => import("@/components/admin/BlockEditor"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--dash-text-muted)" }}>
      <Loader2 size={22} style={{ animation: "spin 1s linear infinite", display: "inline" }} />
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>Memuat editor...</p>
    </div>
  ),
});

const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), { ssr: false, loading: () => <div style={{ height: "120px", background: "var(--dash-surface-hover)", borderRadius: "10px" }} /> });

const CATEGORIES = ["Pariwisata", "Event & Festival", "Budaya", "Ekonomi Kreatif", "Olahraga", "Kepemudaan", "Pengumuman"];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

const fileToDataUrl = (file: File) =>
  new Promise<string>(resolve => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file); });

export default function BuatBeritaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useAdmin();

  /* ── form state ── */
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [shortDesc, setShortDesc] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [categories, setCategories] = useState<string[]>(["Pariwisata"]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cover, setCover] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");

  /* ── ui state ── */
  const [showLib, setShowLib] = useState(false);
  const [coverDrag, setCoverDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  /* ── load existing ── */
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/posts/${editId}`).then(r => r.json()).then(data => {
      if (!data.id) return;
      setTitle(data.title || "");
      setSlug(slugify(data.title || ""));
      setShortDesc(data.shortDesc || "");
      setStatus(data.status || "draft");
      const tagArr = (data.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean);
      const cats = tagArr.filter((t: string) => CATEGORIES.includes(t));
      setCategories(cats.length ? cats : ["Pariwisata"]);
      setTags(tagArr.filter((t: string) => !CATEGORIES.includes(t)));
      setCover(data.imageUrl || "");
      setPublishDate(data.publishDate || "");
      setMetaTitle(data.seoTitle || "");
      setMetaDesc(data.seoDesc || "");
      setKeywords(data.keywords || "");
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed)) { setBlocks(parsed); return; }
      } catch {}
      if (data.content) setBlocks([{ id: "blk_legacy", type: "text", data: { html: `<p>${data.content}</p>` } }]);
    }).catch(console.error);
  }, [editId]);

  /* ── slug auto ── */
  useEffect(() => {
    if (!slugEdited) setSlug(slugify(title));
  }, [title, slugEdited]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const t = tagInput.trim().replace(/,/g, "");
    if (!t || tags.includes(t)) { setTagInput(""); return; }
    setTags(prev => [...prev, t]);
    setTagInput("");
  };

  const handleCoverFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setCover(await fileToDataUrl(file));
  };

  const handleSave = async (overrideStatus?: "draft" | "published") => {
    if (!title.trim()) { alert("Judul artikel wajib diisi."); return; }
    setSaving(true);
    const allTags = [...categories, ...tags].join(", ");
    const payload = {
      title: title.trim(),
      content: JSON.stringify(blocks),
      shortDesc,
      imageUrl: cover,
      status: overrideStatus || status,
      tags: allTags,
      seoTitle: metaTitle || title,
      seoDesc: metaDesc,
      keywords,
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

  const seoTitleVal = metaTitle || title;
  const seoDescVal = metaDesc || shortDesc.replace(/<[^>]+>/g, "").slice(0, 160);
  const slugUrl = slug || slugify(title);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minHeight: "100%" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard/berita"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "9px", border: "1px solid var(--dash-border)", color: "var(--dash-text-soft)", textDecoration: "none", flexShrink: 0 }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-text)"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-text-soft)"; }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Editor Artikel</p>
            <h1 style={{ margin: "1px 0 0", fontSize: "1.15rem", fontWeight: 800, color: "var(--dash-text)" }}>
              {editId ? "Edit Berita" : "Tulis Berita Baru"}
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          {saveMsg && <span style={{ fontSize: "0.8rem", color: "var(--dash-success)", fontWeight: 700 }}>{saveMsg}</span>}
          <button onClick={() => handleSave("draft")} disabled={saving} className="dash-btn"
            style={{ background: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", fontSize: "0.82rem", boxShadow: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button onClick={() => handleSave("published")} disabled={saving} className="dash-btn"
            style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Send size={14} /> Terbitkan
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "start" }} className="buat-grid">

        {/* ══ LEFT CANVAS ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", minWidth: 0 }}>

          {/* Cover Image */}
          <div className="dash-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
            {cover ? (
              <>
                <img src={cover} alt="Cover" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => setShowLib(true)} style={{ padding: "0.4rem 0.75rem", borderRadius: "8px", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Image size={13} /> Ganti
                  </button>
                  <button onClick={() => setCover("")} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "rgba(220,38,38,0.85)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <label
                onDragOver={e => { e.preventDefault(); setCoverDrag(true); }}
                onDragLeave={() => setCoverDrag(false)}
                onDrop={e => { e.preventDefault(); setCoverDrag(false); handleCoverFile(e.dataTransfer.files?.[0]); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "2.5rem 1.5rem", cursor: "pointer", textAlign: "center",
                  background: coverDrag ? "var(--dash-primary-bg)" : "var(--dash-surface-hover)",
                  border: `2px dashed ${coverDrag ? "var(--dash-primary)" : "var(--dash-border-2)"}`,
                  transition: "all 0.2s",
                }}>
                <UploadCloud size={28} style={{ color: "var(--dash-primary)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dash-text)" }}>Seret & lepas foto cover</span>
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>atau klik untuk pilih file</span>
                <input type="file" accept="image/*" onChange={e => handleCoverFile(e.target.files?.[0])} style={{ display: "none" }} />
              </label>
            )}
            {!cover && (
              <div style={{ padding: "0.6rem 0.75rem", borderTop: "1px solid var(--dash-border)", display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setShowLib(true)} className="dash-btn"
                  style={{ background: "transparent", border: "1px solid var(--dash-border)", color: "var(--dash-text)", boxShadow: "none", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Folder size={13} /> Pilih dari Perpustakaan Media
                </button>
              </div>
            )}
          </div>

          {/* Title + Slug */}
          <div className="dash-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Tulis judul artikel yang menarik..."
              style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: "var(--dash-text)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.25rem", borderTop: "1px solid var(--dash-border)" }}>
              <ExternalLink size={13} style={{ color: "var(--dash-text-muted)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", flexShrink: 0 }}>Slug:</span>
              <input
                value={slugUrl} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--dash-text-soft)", fontSize: "0.78rem", fontFamily: "monospace" }}
              />
            </div>
          </div>

          {/* Short Description (Quill) */}
          <div className="dash-card" style={{ padding: "1.1rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <FileText size={15} style={{ color: "var(--dash-primary)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Deskripsi / Ringkasan</span>
            </div>
            <QuillEditor value={shortDesc} onChange={setShortDesc} placeholder="Tulis ringkasan artikel (tampil di kartu berita)..." minHeight={130} />
          </div>

          {/* PageBuilder / Block Canvas */}
          <div className="dash-card" style={{ padding: "1.1rem 1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--dash-border)" }}>
              <FileText size={15} style={{ color: "var(--dash-primary)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Konten Artikel (Page Builder)</span>
            </div>
            <BlockEditor value={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }} className="buat-aside">

          {/* Jadwalkan */}
          <div className="dash-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 800, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CalendarDays size={13} /> Jadwalkan Publikasi
            </p>
            <input type="date" className="dash-input" value={publishDate} onChange={e => setPublishDate(e.target.value)} style={{ fontSize: "0.82rem", colorScheme: "light dark" }} />
            {publishDate && (
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>
                Terbit: {new Date(publishDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          {/* SEO Panel */}
          <div className="dash-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Search size={13} style={{ color: "var(--dash-primary)" }} />
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Optimasi SEO</p>
            </div>

            {/* Google preview */}
            <div style={{ background: "var(--dash-surface-hover)", borderRadius: "9px", padding: "0.85rem", border: "1px solid var(--dash-border)" }}>
              <p style={{ margin: "0 0 2px", fontSize: "0.65rem", color: "var(--dash-text-muted)" }}>disparpora-lamtim.go.id › berita › {slugUrl || "judul-artikel"}</p>
              <p style={{ margin: "0 0 2px", fontSize: "0.88rem", fontWeight: 600, color: "#1a73e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                {seoTitleVal || "Judul artikel akan tampil di sini"}
              </p>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dash-text-soft)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {seoDescVal || "Deskripsi ringkas untuk cuplikan hasil pencarian Google."}
              </p>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Slug URL</label>
              </div>
              <input className="dash-input" value={slugUrl} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }} style={{ fontSize: "0.76rem", fontFamily: "monospace" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Meta Judul</label>
                <span style={{ fontSize: "0.65rem", color: (metaTitle || title).length > 60 ? "var(--dash-danger)" : "var(--dash-text-muted)" }}>{(metaTitle || title).length}/60</span>
              </div>
              <input className="dash-input" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title || "Judul di hasil pencarian..."} style={{ fontSize: "0.76rem" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Meta Deskripsi</label>
                <span style={{ fontSize: "0.65rem", color: metaDesc.length > 160 ? "var(--dash-danger)" : "var(--dash-text-muted)" }}>{metaDesc.length}/160</span>
              </div>
              <textarea className="dash-input" rows={3} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Deskripsi ringkas untuk cuplikan pencarian..." style={{ fontSize: "0.76rem", resize: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600, marginBottom: "0.3rem" }}>Keywords</label>
              <input className="dash-input" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="pariwisata, lampung timur, ..." style={{ fontSize: "0.76rem" }} />
            </div>
          </div>

          {/* Kategori & Tag */}
          <div className="dash-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Folder size={13} style={{ color: "var(--dash-primary)" }} />
              <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Kategori & Tag</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.3rem 0" }}>
                  <input
                    type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)}
                    style={{ accentColor: "var(--dash-primary)", width: "15px", height: "15px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "var(--dash-text)", fontWeight: categories.includes(cat) ? 600 : 400 }}>{cat}</span>
                </label>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
                <Hash size={12} style={{ color: "var(--dash-text-muted)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>Tag</span>
              </div>
              {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.5rem" }}>
                  {tags.map(t => (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.55rem", borderRadius: "999px", background: "var(--dash-primary-bg)", color: "var(--dash-primary)", fontSize: "0.72rem", fontWeight: 600 }}>
                      {t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "1rem" }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <input
                className="dash-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder="Tulis tag, tekan Enter..." style={{ fontSize: "0.76rem" }}
              />
            </div>
          </div>

        </div>
      </div>

      {showLib && (
        <MediaLibrary
          onSelect={(item: MediaItem) => { setCover(item.src); setShowLib(false); }}
          onClose={() => setShowLib(false)}
        />
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .buat-grid { grid-template-columns: 1fr !important; }
          .buat-aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}
