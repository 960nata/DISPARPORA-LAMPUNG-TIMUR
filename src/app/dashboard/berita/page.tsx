"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye, FileText } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface NewsPost { id: string; title: string; authorName: string; createdAt: string; status: string; tags: string; imageUrl: string; }

export default function BeritaPage() {
  const { user } = useAdmin();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(data => { if (Array.isArray(data)) setPosts(data); }).finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/posts/${deleteConfirm.id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "white" }}>CMS Berita</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "0.2rem" }}>Kelola artikel dan berita pariwisata</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "var(--dash-card-2)" }}>
          <Search size={15} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
          <input type="text" placeholder="Cari berita..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ border: "none", outline: "none", background: "transparent", color: "white", fontSize: "0.85rem", width: "160px" }} />
        </div>
        <Link href="/dashboard/berita/buat" className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", textDecoration: "none", padding: "0.55rem 1rem" }}>
          <Plus size={16} /> Buat Artikel
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Artikel", value: posts.length, color: "var(--dash-primary)" },
          { label: "Diterbitkan", value: posts.filter(p => p.status === "published").length, color: "var(--dash-success)" },
          { label: "Draft", value: posts.filter(p => p.status === "draft").length, color: "var(--dash-warning)" },
        ].map(s => (
          <div key={s.label} className="dash-card" style={{ padding: "1rem 1.25rem" }}>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: "48px" }}></th>
                <th>Judul Artikel</th>
                <th>Penulis</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat data...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>
                  <FileText size={32} style={{ marginBottom: "0.75rem", opacity: 0.3 }} /><br />
                  {search ? "Tidak ada hasil pencarian" : "Belum ada artikel. Buat artikel pertama!"}
                </td></tr>
              ) : paged.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", display: "block" }} /> : <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "var(--dash-card-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} style={{ color: "var(--dash-text-muted)" }} /></div>}
                  </td>
                  <td style={{ fontWeight: 700, color: "white", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                  <td style={{ fontSize: "0.82rem" }}>{p.authorName}</td>
                  <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    <span className={`dash-badge ${p.status === "published" ? "dash-badge-success" : "dash-badge-warning"}`}>
                      {p.status === "published" ? "Terbit" : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                      <Link href={`/berita/${p.id}`} target="_blank" style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "0.3rem", display: "inline-flex" }} title="Preview"><Eye size={15} /></Link>
                      <Link href={`/dashboard/berita/buat?id=${p.id}`} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.3rem", display: "inline-flex" }} title="Edit"><Edit2 size={15} /></Link>
                      <button onClick={() => setDeleteConfirm({ id: p.id, title: p.title })} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.3rem" }} title="Hapus"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem", borderTop: "1px solid var(--dash-border)" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", opacity: page === 1 ? 0.4 : 1 }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", backgroundColor: pg === page ? "var(--dash-primary)" : "transparent", border: "1px solid var(--dash-border)" }}>{pg}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dash-btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", opacity: page === totalPages ? 0.4 : 1 }}>›</button>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "400px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Trash2 size={22} style={{ color: "#f87171" }} /></div>
              <div>
                <h4 style={{ margin: "0 0 0.4rem", fontWeight: 800, color: "white" }}>Hapus Artikel?</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>Artikel <strong style={{ color: "white" }}>"{deleteConfirm.title}"</strong> akan dihapus permanen.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn" style={{ flex: 1, backgroundColor: "#dc2626" }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
