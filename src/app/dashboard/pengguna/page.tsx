"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Users, ShieldCheck, 
  UserCheck, ShieldAlert, Award, X 
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface AdminUser { id: string; username: string; name: string; role: string; }

const ROLE_LABELS: Record<string, string> = { superadmin: "Superadmin", admin_dinas: "Admin Dinas", admin_post: "Admin Post" };
const ROLE_COLORS: Record<string, { bg: string; color: string; icon: any }> = {
  superadmin:  { bg: "var(--dash-danger-bg)",  color: "var(--dash-danger)", icon: ShieldCheck },
  admin_dinas: { bg: "var(--dash-success-bg)", color: "var(--dash-success)", icon: UserCheck },
  admin_post:  { bg: "var(--dash-warning-bg)", color: "var(--dash-warning)", icon: Award },
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
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--dash-text-muted)", gap: "12px" }}>
        <ShieldAlert size={40} style={{ color: "var(--dash-danger)", opacity: 0.6 }} />
        <h3 style={{ color: "var(--dash-text)", fontWeight: 700, fontSize: "1rem", margin: 0 }}>Akses Ditolak</h3>
        <p style={{ margin: 0, fontSize: "0.82rem", maxWidth: "300px", textAlign: "center", color: "var(--dash-text-muted)" }}>Halaman ini hanya dapat diakses oleh Superadmin.</p>
      </div>
    );
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--dash-text)" }}>Manajemen Akun</h1>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>
            Kelola data akun staf dan batasan akses.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
            <input className="dash-input" type="text" placeholder="Cari staf..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "32px", width: "180px" }} />
          </div>
          <button onClick={openAdd} className="dash-btn" style={{ padding: "8px 14px" }}>
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* Role Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="grid-charts">
        {(["superadmin", "admin_dinas", "admin_post"] as const).map(role => {
          const c = ROLE_COLORS[role];
          const Icon = c.icon;
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="dash-stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--dash-text-muted)" }}>{ROLE_LABELS[role]}</span>
                  <h3 style={{ fontSize: "1.5rem", color: "var(--dash-text)", fontWeight: 700, margin: "2px 0 0" }}>{count}</h3>
                </div>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Table */}
      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Peran</th>
                <th style={{ textAlign: "right", width: "80px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "var(--dash-text-muted)" }}>Tidak ada pengguna ditemukan.</td></tr>
              ) : filtered.map(u => {
                const c = ROLE_COLORS[u.role] || ROLE_COLORS.admin_post;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--dash-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "var(--dash-primary)", flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>{u.name}</span>
                      </div>
                    </td>
                    <td><code style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)" }}>{u.username}</code></td>
                    <td><span className="dash-badge" style={{ backgroundColor: c.bg, color: c.color }}>{ROLE_LABELS[u.role] || u.role}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button onClick={() => openEdit(u)} title="Edit" style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: "var(--dash-primary)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center" }}>
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => { if (u.id === currentUser?.id) { alert("Tidak bisa menghapus akun sendiri."); return; } setDeleteConfirm({ id: u.id, name: u.name }); }} 
                          disabled={u.id === "usr_superadmin"} title="Hapus"
                          style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px", color: u.id === "usr_superadmin" ? "var(--dash-text-muted)" : "var(--dash-danger)", cursor: u.id === "usr_superadmin" ? "not-allowed" : "pointer", padding: "6px", display: "flex", alignItems: "center", opacity: u.id === "usr_superadmin" ? 0.35 : 1 }}>
                          <Trash2 size={13} />
                        </button>
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
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "440px", position: "relative" }}>
            <button onClick={() => setModalOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={18} /></button>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700, color: "var(--dash-text)", fontSize: "1rem" }}>{modalMode === "add" ? "Tambah Akun Admin" : "Edit Profil Staf"}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Nama Lengkap *", key: "name", type: "text", placeholder: "Nama lengkap staf" },
                { label: "Username *", key: "username", type: "text", placeholder: "username_admin", disabled: modalMode === "edit" },
                { label: `Password${modalMode === "edit" ? " (opsional)" : " *"}`, key: "password", type: "password", placeholder: "••••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>{f.label}</label>
                  <input type={f.type} className="dash-input" value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} disabled={(f as any).disabled} required={f.key !== "password" || modalMode === "add"} style={{ cursor: (f as any).disabled ? "not-allowed" : "text" }} />
                </div>
              ))}
              
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Peran *</label>
                <select className="dash-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ cursor: "pointer" }}>
                  <option value="superadmin">Superadmin — Akses Penuh</option>
                  <option value="admin_dinas">Admin Dinas — Destinasi & Kategori</option>
                  <option value="admin_post">Admin Post — Penulis Berita</option>
                </select>
              </div>

              {formErr && <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-danger)", backgroundColor: "var(--dash-danger-bg)", padding: "8px 12px", borderRadius: "6px" }}>{formErr}</p>}
              
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button type="button" onClick={() => setModalOpen(false)} className="dash-btn dash-btn-secondary" style={{ flex: 1, padding: "10px" }}>Batal</button>
                <button type="submit" className="dash-btn" style={{ flex: 1, padding: "10px" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--dash-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: "var(--dash-danger)" }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--dash-text)", fontWeight: 700, fontSize: "0.95rem" }}>Hapus Akun?</h4>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--dash-text)" }}>{deleteConfirm.name}</strong> akan dihapus permanen.
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
