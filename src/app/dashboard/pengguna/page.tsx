"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Users, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface AdminUser { id: string; username: string; name: string; role: string; }

const ROLE_LABELS: Record<string, string> = { superadmin: "Superadmin", admin_dinas: "Admin Dinas", admin_post: "Admin Post" };
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  superadmin:  { bg: "rgba(239,68,68,0.15)",  color: "#f87171" },
  admin_dinas: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  admin_post:  { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
};

export default function PenggunaPage() {
  const { user: currentUser } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState({ id: "", username: "", password: "", name: "", role: "admin_post" });
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => { if (Array.isArray(data)) setUsers(data); }).finally(() => setLoading(false));
  }, []);

  if (currentUser?.role !== "superadmin") {
    return <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
      <ShieldCheck size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
      <p>Halaman ini hanya untuk Superadmin.</p>
    </div>;
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setModalMode("add"); setForm({ id: "", username: "", password: "", name: "", role: "admin_post" }); setFormErr(""); setModalOpen(true); };
  const openEdit = (u: AdminUser) => { setModalMode("edit"); setForm({ id: u.id, username: u.username, password: "", name: u.name, role: u.role }); setFormErr(""); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormErr("");
    if (!form.name || !form.username || (modalMode === "add" && !form.password)) { setFormErr("Field bertanda * wajib diisi."); return; }
    const isAdd = modalMode === "add";
    const res = await fetch(isAdd ? "/api/users" : `/api/users/${form.id}`, { method: isAdd ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setFormErr(data.error || "Gagal menyimpan"); return; }
    setUsers(prev => isAdd ? [...prev, data] : prev.map(u => u.id === data.id ? data : u));
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await fetch(`/api/users/${deleteConfirm.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Gagal menghapus"); return; }
    setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "white" }}>Manajemen Pengguna</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "0.2rem" }}>Kelola akun dan peran staf admin</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "var(--dash-card-2)" }}>
          <Search size={15} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
          <input type="text" placeholder="Cari staf..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: "white", fontSize: "0.85rem", width: "140px" }} />
        </div>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.55rem 1rem" }}>
          <Plus size={16} /> Tambah Admin
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {(["superadmin", "admin_dinas", "admin_post"] as const).map(role => {
          const c = ROLE_COLORS[role];
          return (
            <div key={role} className="dash-card" style={{ padding: "1rem 1.25rem" }}>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>{ROLE_LABELS[role]}</p>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: c.color }}>{users.filter(u => u.role === role).length}</p>
            </div>
          );
        })}
      </div>

      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Nama Staf</th>
                <th>Username</th>
                <th>Peran</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</td></tr>
              ) : filtered.map(u => {
                const c = ROLE_COLORS[u.role] || ROLE_COLORS.admin_post;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "var(--dash-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: "white", flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                        <span style={{ fontWeight: 700, color: "white" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>{u.username}</td>
                    <td>
                      <span className="dash-badge" style={{ backgroundColor: c.bg, color: c.color }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <button onClick={() => openEdit(u)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.3rem" }}><Edit2 size={15} /></button>
                        <button onClick={() => { if (u.id === currentUser?.id) { alert("Tidak bisa menghapus akun sendiri."); return; } setDeleteConfirm({ id: u.id, name: u.name }); }} disabled={u.id === "usr_superadmin"} style={{ background: "none", border: "none", color: u.id === "usr_superadmin" ? "var(--dash-border-2)" : "var(--dash-danger)", cursor: u.id === "usr_superadmin" ? "not-allowed" : "pointer", padding: "0.3rem" }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "440px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ margin: 0, fontWeight: 800, color: "white" }}>{modalMode === "add" ? "Tambah Admin Baru" : "Edit Profil Admin"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Nama Lengkap *", key: "name", type: "text", placeholder: "Nama staf" },
                { label: "Username *", key: "username", type: "text", placeholder: "username_staf", disabled: modalMode === "edit" },
                { label: `Password${modalMode === "edit" ? " (kosong = tidak berubah)" : " *"}`, key: "password", type: "password", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>{f.label}</label>
                  <input type={f.type} className="dash-input" value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} disabled={(f as any).disabled} required={f.key !== "password" || modalMode === "add"} style={{ cursor: (f as any).disabled ? "not-allowed" : "text" }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Peran (Role) *</label>
                <select className="dash-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="superadmin">Superadmin — Akses Penuh</option>
                  <option value="admin_dinas">Admin Dinas — Destinasi & Hotel</option>
                  <option value="admin_post">Admin Post — CMS Berita</option>
                </select>
              </div>
              {formErr && <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-danger)", backgroundColor: "rgba(239,68,68,0.1)", padding: "0.5rem 0.75rem", borderRadius: "6px" }}>{formErr}</p>}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button type="button" onClick={() => setModalOpen(false)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                <button type="submit" className="dash-btn" style={{ flex: 1 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "400px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Trash2 size={22} style={{ color: "#f87171" }} /></div>
              <div><h4 style={{ margin: "0 0 0.4rem", color: "white", fontWeight: 800 }}>Hapus Admin?</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--dash-text-muted)" }}>Akun <strong style={{ color: "white" }}>{deleteConfirm.name}</strong> akan dihapus permanen.</p></div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
              <button onClick={handleDelete} className="dash-btn" style={{ flex: 1, backgroundColor: "#dc2626" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
