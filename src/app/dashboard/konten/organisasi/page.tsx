"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { Official, Modal, DeleteModal, PhotoUploadField, Field } from "../_shared";

function OfficialContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Official> | null }>({ open: false, item: null });
  const [del, setDel] = useState<Official | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/officials");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { toast({ type: "error", title: "Gagal memuat data pejabat" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, item: { name: "", title: "", role: "", photoUrl: "", order: items.length } });
  const openEdit = (item: Official) => setModal({ open: true, item: { ...item } });

  const save = async () => {
    if (!modal.item) return;
    setSaving(true);
    try {
      const { id, ...rest } = modal.item as Official;
      if (id) {
        await fetch(`/api/officials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Data pejabat diperbarui." });
      } else {
        await fetch("/api/officials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Pejabat baru ditambahkan." });
      }
      setModal({ open: false, item: null });
      load();
    } catch { toast({ type: "error", title: "Gagal menyimpan data" }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!del) return;
    try {
      await fetch(`/api/officials/${del.id}`, { method: "DELETE" });
      toast({ type: "success", title: "Dihapus!", message: `${del.name} telah dihapus.` });
      setDel(null);
      load();
    } catch { toast({ type: "error", title: "Gagal menghapus" }); }
  };

  const setField = (key: keyof Official, val: any) => setModal(m => ({ ...m, item: { ...m.item, [key]: val } }));
  const letterAvatar = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.875rem" }}>Kelola susunan pejabat Dinas yang ditampilkan di portal.</p>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "0.875rem", borderRadius: "11px" }}>
          <Plus size={16} /> Tambah
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {items.map(item => (
            <div key={item.id} className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "1.125rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.name} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--dash-border)" }} />
                ) : (
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.15rem", flexShrink: 0 }}>
                    {letterAvatar(item.name)}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--dash-primary)", fontWeight: 600, marginTop: "2px" }}>{item.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>{item.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button onClick={() => openEdit(item)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px", borderRadius: "9px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => setDel(item)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px", borderRadius: "9px", border: "1px solid var(--dash-danger)", background: "transparent", color: "var(--dash-danger)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item?.id ? "Edit Pejabat" : "Tambah Pejabat"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Nama">
            <input className="dash-input" type="text" value={modal.item?.name ?? ""} onChange={e => setField("name", e.target.value)} placeholder="Nama lengkap" />
          </Field>
          <Field label="Jabatan (Singkat)">
            <input className="dash-input" type="text" value={modal.item?.title ?? ""} onChange={e => setField("title", e.target.value)} placeholder="Contoh: Kepala Dinas" />
          </Field>
          <Field label="Peran / Bidang">
            <input className="dash-input" type="text" value={modal.item?.role ?? ""} onChange={e => setField("role", e.target.value)} placeholder="Contoh: Pengembangan Destinasi" />
          </Field>
          <Field label="Urutan">
            <input className="dash-input" type="number" value={modal.item?.order ?? 0} onChange={e => setField("order", Number(e.target.value))} />
          </Field>
          <PhotoUploadField label="Foto" value={modal.item?.photoUrl ?? ""} onChange={val => setField("photoUrl", val)} />
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
            <button onClick={() => setModal({ open: false, item: null })} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              Batal
            </button>
            <button onClick={save} disabled={saving} className="dash-btn" style={{ padding: "9px 18px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}>
              <Save size={15} /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteModal open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} label={del?.name ?? ""} />
    </>
  );
}

export default function OrganisasiPage() {
  const { user } = useAdmin();

  if (!user) return null;
  const allowed = user.role === "superadmin" || user.role === "admin_dinas";
  if (!allowed) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600 }}>Akses Ditolak</p>
        <p style={{ fontSize: "0.875rem" }}>Halaman ini hanya dapat diakses oleh superadmin dan admin_dinas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "var(--font-main)" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.02em" }}>
          Struktur Organisasi
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Kelola susunan pejabat dinas yang ditampilkan di portal.
        </p>
      </div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <OfficialContent />
      </div>
    </div>
  );
}
