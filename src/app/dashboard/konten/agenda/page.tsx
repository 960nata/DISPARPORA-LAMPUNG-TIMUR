"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Edit2, Trash2, Save } from "lucide-react";
import { AppEvent, Modal, DeleteModal, Field } from "../_shared";

function EventContent() {
  const { toast } = useToast();
  const [items, setItems] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<AppEvent> | null }>({ open: false, item: null });
  const [del, setDel] = useState<AppEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { toast({ type: "error", title: "Gagal memuat agenda" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, item: { title: "", date: "", location: "", desc: "", status: "Mendatang", image: "" } });
  const openEdit = (item: AppEvent) => setModal({ open: true, item: { ...item } });

  const save = async () => {
    if (!modal.item) return;
    setSaving(true);
    try {
      const { id, ...rest } = modal.item as AppEvent;
      if (id) {
        await fetch(`/api/events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Agenda diperbarui." });
      } else {
        await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) });
        toast({ type: "success", title: "Berhasil!", message: "Agenda baru ditambahkan." });
      }
      setModal({ open: false, item: null });
      load();
    } catch { toast({ type: "error", title: "Gagal menyimpan" }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!del) return;
    try {
      await fetch(`/api/events/${del.id}`, { method: "DELETE" });
      toast({ type: "success", title: "Dihapus!", message: `${del.title} dihapus.` });
      setDel(null);
      load();
    } catch { toast({ type: "error", title: "Gagal menghapus" }); }
  };

  const setField = (key: keyof AppEvent, val: any) => setModal(m => ({ ...m, item: { ...m.item, [key]: val } }));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <p style={{ margin: 0, color: "var(--dash-text-muted)", fontSize: "0.875rem" }}>Kelola agenda dan event yang ditampilkan di portal wisata.</p>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "0.875rem", borderRadius: "11px" }}>
          <Plus size={16} /> Tambah Event
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map(item => (
            <div key={item.id} className="dash-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "1.125rem" }}>
              {item.image && (
                <img src={item.image} alt={item.title} style={{ width: "120px", height: "80px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--dash-border)" }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px",
                    background: item.status === "Mendatang" ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                    color: item.status === "Mendatang" ? "var(--dash-success)" : "var(--dash-text-muted)"
                  }}>{item.status}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--dash-text)" }}>{item.title}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--dash-primary)", fontWeight: 600, marginTop: "2px" }}>{item.date}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--dash-text-muted)", marginTop: "2px" }}>{item.location}</div>
                <p style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "6px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                  {item.desc}
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

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item?.id ? "Edit Event" : "Tambah Event"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Judul Event">
            <input className="dash-input" type="text" value={modal.item?.title ?? ""} onChange={e => setField("title", e.target.value)} placeholder="Nama event" />
          </Field>
          <Field label="Tanggal">
            <input className="dash-input" type="text" value={modal.item?.date ?? ""} onChange={e => setField("date", e.target.value)} placeholder="Contoh: 24 - 26 Oktober 2026" />
          </Field>
          <Field label="Lokasi">
            <input className="dash-input" type="text" value={modal.item?.location ?? ""} onChange={e => setField("location", e.target.value)} placeholder="Nama tempat, kecamatan" />
          </Field>
          <Field label="Deskripsi">
            <textarea className="dash-input" rows={3} value={modal.item?.desc ?? ""} onChange={e => setField("desc", e.target.value)} placeholder="Deskripsi singkat event..." style={{ resize: "vertical" }} />
          </Field>
          <Field label="Status">
            <select className="dash-input" value={modal.item?.status ?? "Mendatang"} onChange={e => setField("status", e.target.value)}>
              <option value="Mendatang">Mendatang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </Field>
          <Field label="URL Gambar">
            <input className="dash-input" type="text" value={modal.item?.image ?? ""} onChange={e => setField("image", e.target.value)} placeholder="https://..." />
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

      <DeleteModal open={!!del} onClose={() => setDel(null)} onConfirm={confirmDelete} label={del?.title ?? ""} />
    </>
  );
}

export default function AgendaPage() {
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
          Agenda & Event
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Kelola agenda dan event yang akan ditampilkan di portal wisata.
        </p>
      </div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <EventContent />
      </div>
    </div>
  );
}
