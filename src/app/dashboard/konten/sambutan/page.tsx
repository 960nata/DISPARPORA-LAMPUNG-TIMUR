"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { Speech, Modal, DeleteModal, PhotoUploadField, Field } from "../_shared";

function SpeechContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Speech> | null }>({ open: false, item: null });
  const [del, setDel] = useState<Speech | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/speeches");
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { toast({ type: "error", title: "Gagal memuat sambutan" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, item: { name: "", title: "", badge: "", photoUrl: "", welcomeSpeech: "", order: items.length } });
  const openEdit = (item: Speech) => setModal({ open: true, item: { ...item } });

  const save = async () => {
    if (!modal.item) return;
    setSaving(true);
    try {
      const { id, ...rest } = modal.item as Speech;
      if (id) {
        await fetch(`/api/speeches/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Sambutan diperbarui." });
      } else {
        await fetch("/api/speeches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Sambutan baru ditambahkan." });
      }
      setModal({ open: false, item: null });
      load();
    } catch { toast({ type: "error", title: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!del) return;
    try {
      await fetch(`/api/speeches/${del.id}`, { method: "DELETE" });
      toast({ type: "success", title: "Dihapus!", message: `Sambutan ${del.name} dihapus.` });
      setDel(null);
      load();
    } catch { toast({ type: "error", title: "Gagal menghapus" }); }
  };

  const setField = (key: keyof Speech, val: any) => setModal(m => ({ ...m, item: { ...m.item, [key]: val } }));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.875rem" }}>Kelola carousel sambutan yang ditampilkan di halaman utama portal.</p>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "0.875rem", borderRadius: "11px" }}>
          <Plus size={16} /> Tambah
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map(item => (
            <div key={item.id} className="dash-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "1.125rem" }}>
              <img src={item.photoUrl || "/leaders/kadis.avif"} alt={item.name} style={{ width: "60px", height: "70px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--dash-border)" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", background: "rgba(var(--dash-primary-rgb, 16,185,129), 0.12)", color: "var(--dash-primary)" }}>{item.badge}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dash-text)" }}>{item.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--dash-primary)", fontWeight: 600, marginTop: "2px" }}>{item.title}</div>
                <p style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "6px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                  "{item.welcomeSpeech}"
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => openEdit(item)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text-muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDel(item)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--dash-danger)", background: "transparent", color: "var(--dash-danger)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item?.id ? "Edit Sambutan" : "Tambah Sambutan"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Nama">
            <input className="dash-input" type="text" value={modal.item?.name ?? ""} onChange={e => setField("name", e.target.value)} placeholder="Nama pejabat" />
          </Field>
          <Field label="Jabatan">
            <input className="dash-input" type="text" value={modal.item?.title ?? ""} onChange={e => setField("title", e.target.value)} placeholder="Contoh: Bupati Lampung Timur" />
          </Field>
          <Field label="Label Badge">
            <input className="dash-input" type="text" value={modal.item?.badge ?? ""} onChange={e => setField("badge", e.target.value)} placeholder="Contoh: Sambutan Bupati" />
          </Field>
          <PhotoUploadField label="Foto" value={modal.item?.photoUrl ?? ""} onChange={val => setField("photoUrl", val)} />
          <Field label="Teks Sambutan">
            <textarea className="dash-input" rows={5} value={modal.item?.welcomeSpeech ?? ""} onChange={e => setField("welcomeSpeech", e.target.value)} placeholder="Isi teks sambutan..." style={{ resize: "vertical", minHeight: "100px" }} />
          </Field>
          <Field label="Urutan">
            <input className="dash-input" type="number" value={modal.item?.order ?? 0} onChange={e => setField("order", Number(e.target.value))} />
          </Field>
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

export default function SambutanPage() {
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
          Sambutan Kepala Daerah
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Edit teks dan foto sambutan yang ditampilkan di halaman utama.
        </p>
      </div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <SpeechContent />
      </div>
    </div>
  );
}
