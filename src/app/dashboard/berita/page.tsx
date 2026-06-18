"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit2, Trash2, Eye, FileText,
  BookOpen, CheckCircle, Edit, Globe
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface NewsPost { 
  id: string; title: string; authorName: string; createdAt: string; 
  status: string; tags: string; imageUrl: string; 
}

export default function BeritaPage() {
  const { user } = useAdmin();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [page, setPage] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(data => { if (Array.isArray(data)) setPosts(data); }).finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePublishAll = async () => {
    const draftCount = posts.filter(p => p.status !== "published").length;
    if (draftCount === 0) return;
    setPublishing(true);
    const res = await fetch("/api/posts/publish-all", { method: "POST" });
    if (res.ok) {
      setPosts(prev => prev.map(p => ({ ...p, status: "published" })));
    }
    setPublishing(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/posts/${deleteConfirm.id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Kelola Konten</p>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-text)" }}>Publikasi Berita</h1>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
            Kelola rilis berita, kegiatan, dan promosi wisata daerah.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
            <input className="dash-input" type="text" placeholder="Cari artikel..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: "32px", width: "200px" }} />
          </div>
          {posts.filter(p => p.status !== "published").length > 0 && (
            <button onClick={handlePublishAll} disabled={publishing} className="dash-btn" style={{ padding: "8px 14px", background: "linear-gradient(135deg, var(--dash-success), #059669)" }}>
              <Globe size={14} /> {publishing ? "Menerbitkan..." : `Terbitkan Semua (${posts.filter(p => p.status !== "published").length})`}
            </button>
          )}
          <Link href="/dashboard/berita/buat" className="dash-btn" style={{ padding: "8px 14px", textDecoration: "none" }}>
            <Plus size={14} /> Buat Artikel
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="grid-charts">
        {[
          { label: "Total Artikel", value: posts.length, color: "var(--dash-primary)", icon: BookOpen },
          { label: "Diterbitkan", value: posts.filter(p => p.status === "published").length, color: "var(--dash-success)", icon: CheckCircle },
          { label: "Draft", value: posts.filter(p => p.status === "draft").length, color: "var(--dash-warning)", icon: Edit },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="dash-stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dash-text-muted)" }}>{s.label}</span>
                  <h3 style={{ fontSize: "1.5rem", color: "var(--dash-text)", fontWeight: 700, margin: "2px 0 0" }}>{s.value}</h3>
                </div>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `color-mix(in srgb, ${s.color} 10%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: "48px" }}></th>
                <th>Judul Artikel</th>
                <th>Penulis</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th style={{ textAlign: "right", width: "100px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Memuat data...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>
                  {search ? "Tidak ada hasil pencarian." : "Belum ada artikel."}
                </td></tr>
              ) : paged.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", display: "block", border: "1px solid var(--dash-border)" }} />
                    ) : (
                      <div style={{ width: "36px", height: "36px", borderRadius: "6px", backgroundColor: "var(--dash-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={14} style={{ color: "var(--dash-text-muted)" }} />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--dash-text)", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </td>
                  <td>{p.authorName}</td>
                  <td style={{ fontSize: "0.82rem", color: "var(--dash-text-soft)" }}>
                    {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <span className={`dash-badge ${p.status === "published" ? "dash-badge-success" : "dash-badge-warning"}`}>
                      {p.status === "published" ? "Terbit" : "Draft"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <Link href={`/berita/${p.id}`} target="_blank" title="Preview" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-text-muted)", padding: "6px", display: "inline-flex", alignItems: "center" }}>
                        <Eye size={13} />
                      </Link>
                      <Link href={`/dashboard/berita/buat?id=${p.id}`} title="Edit" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-primary)", padding: "6px", display: "inline-flex", alignItems: "center" }}>
                        <Edit2 size={13} />
                      </Link>
                      <button onClick={() => setDeleteConfirm({ id: p.id, title: p.title })} title="Hapus" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-danger)", cursor: "pointer", padding: "6px", display: "inline-flex", alignItems: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--dash-border)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dash-btn dash-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dash-btn dash-btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--dash-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: "var(--dash-danger)" }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--dash-text)", fontWeight: 700, fontSize: "0.95rem" }}>Hapus Artikel?</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>
                  "<strong style={{ color: "var(--dash-text)" }}>{deleteConfirm.title}</strong>" akan dihapus permanen.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn dash-btn-secondary" style={{ flex: 1, padding: "8px" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn dash-btn-danger" style={{ flex: 1, padding: "8px" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
