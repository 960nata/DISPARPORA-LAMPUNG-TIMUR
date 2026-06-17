"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { Partner, Modal, DeleteModal, Field } from "../_shared";

function PartnerContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Partner> | null }>({ open: false, item: null });
  const [del, setDel] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partners");
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { toast({ type: "error", title: "Gagal memuat partner" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, item: { name: "", logoUrl: "" } });
  const openEdit = (item: Partner) => setModal({ open: true, item: { ...item } });

  const save = async () => {
    if (!modal.item) return;
    setSaving(true);
    try {
      const { id, ...rest } = modal.item as Partner;
      if (id) {
        await fetch(`/api/partners/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Partner diperbarui." });
      } else {
        await fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Partner baru ditambahkan." });
      }
      setModal({ open: false, item: null });
      load();
    } catch { toast({ type: "error", title: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!del) return;
    try {
      await fetch(`/api/partners/${del.id}`, { method: "DELETE" });
      toast({ type: "success", title: "Dihapus!", message: `${del.name} dihapus.` });
      setDel(null);
      load();
    } catch { toast({ type: "error", title: "Gagal menghapus" }); }
  };

  const setField = (key: keyof Partner, val: string) => setModal(m => ({ ...m, item: { ...m.item, [key]: val } }));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.875rem" }}>Kelola logo partner dan mitra yang tampil di halaman utama.</p>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "0.875rem", borderRadius: "11px" }}>
          <Plus size={16} /> Tambah Partner
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
          {items.map(item => (
            <div key={item.id} className="dash-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={item.logoUrl} alt={item.name} style={{ maxHeight: "72px", maxWidth: "140px", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-muted)", lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ display: "flex", gap: "6px", width: "100%", marginTop: "4px" }}>
                <button onClick={() => openEdit(item)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setDel(item)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px", borderRadius: "8px", border: "1px solid var(--dash-danger)", background: "transparent", color: "var(--dash-danger)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item?.id ? "Edit Partner" : "Tambah Partner"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Nama Partner">
            <input className="dash-input" type="text" value={modal.item?.name ?? ""} onChange={e => setField("name", e.target.value)} placeholder="Nama lembaga / mitra" />
          </Field>
          <Field label="URL Logo">
            <input className="dash-input" type="text" value={modal.item?.logoUrl ?? ""} onChange={e => setField("logoUrl", e.target.value)} placeholder="/logo.avif atau https://..." />
          </Field>
          {modal.item?.logoUrl && (
            <div style={{ display: "flex", justifyContent: "center", padding: "12px", background: "var(--dash-bg)", borderRadius: "10px", border: "1px solid var(--dash-border)" }}>
              <img src={modal.item.logoUrl} alt="preview" style={{ maxHeight: "60px", maxWidth: "200px", objectFit: "contain" }} />
            </div>
          )}
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

export default function PartnerPage() {
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
          Partner Kami
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Kelola logo dan nama mitra yang ditampilkan di halaman utama.
        </p>
      </div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <PartnerContent />
      </div>
    </div>
  );
}
