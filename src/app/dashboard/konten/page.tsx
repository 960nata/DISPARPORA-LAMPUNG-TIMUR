"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { useSearchParams } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, Upload } from "lucide-react";

/* ─── Types ─── */
interface Official {
  id: string;
  name: string;
  title: string;
  role: string;
  photoUrl?: string;
  order: number;
}

interface Speech {
  id: string;
  name: string;
  title: string;
  badge: string;
  photoUrl: string;
  welcomeSpeech: string;
  order: number;
}

interface AppEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  status: "Mendatang" | "Selesai";
  image?: string;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

/* ─── Shared Modal ─── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "16px"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--dash-card)", borderRadius: "20px",
          padding: "1.75rem", width: "100%", maxWidth: "500px",
          boxShadow: "0 32px 64px -16px rgba(0,0,0,0.4)",
          border: "1px solid var(--dash-border)", maxHeight: "90vh", overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--dash-text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-muted)", padding: "4px", borderRadius: "6px", display: "flex" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ─── */
function DeleteModal({ open, onClose, onConfirm, label }: { open: boolean; onClose: () => void; onConfirm: () => void; label: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi Hapus">
      <p style={{ color: "var(--dash-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Apakah Anda yakin ingin menghapus <strong style={{ color: "var(--dash-text)" }}>{label}</strong>? Tindakan ini tidak dapat dibatalkan.
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "transparent", color: "var(--dash-text)", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
          Batal
        </button>
        <button onClick={onConfirm} className="dash-btn" style={{ padding: "9px 18px", borderRadius: "10px", background: "var(--dash-danger)", boxShadow: "none", fontSize: "0.875rem" }}>
          Hapus
        </button>
      </div>
    </Modal>
  );
}

/* ─── Photo Upload Helper ─── */
function PhotoUploadField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string ?? "");
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>{label}</label>
      <input className="dash-input" type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="URL foto atau upload di bawah" style={{ marginBottom: "8px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button type="button" onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--dash-border)", background: "var(--dash-bg)", color: "var(--dash-text-muted)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
          <Upload size={14} /> Upload File
        </button>
        {value && (
          <img src={value} alt="preview" style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--dash-border)" }} />
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

/* ─── Field Row Helper ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── TAB 1: Struktur Organisasi ─── */
function OfficialTab() {
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
    <div>
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
    </div>
  );
}

/* ─── TAB 2: Sambutan ─── */
function SpeechTab() {
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
    <div>
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
    </div>
  );
}

/* ─── TAB 3: Agenda & Event ─── */
function EventTab() {
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
    <div>
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
    </div>
  );
}

/* ─── TAB 4: Partner Kami ─── */
function PartnerTab() {
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
    <div>
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
    </div>
  );
}

/* ─── Main Page ─── */
const TABS = [
  { id: "struktur", label: "Struktur Organisasi" },
  { id: "sambutan", label: "Sambutan" },
  { id: "agenda", label: "Agenda & Event" },
  { id: "partner", label: "Partner Kami" },
];

export default function KontenPage() {
  const { user } = useAdmin();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam ?? "struktur");

  // Sync when URL query changes (sidebar navigation)
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

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
      {/* Page Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.02em" }}>
          Manajemen Konten
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>
          Edit konten yang ditampilkan pada halaman utama portal wisata.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="dash-card" style={{ padding: "6px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "all 0.2s",
              background: activeTab === tab.id ? "var(--dash-primary)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--dash-text-muted)",
              boxShadow: activeTab === tab.id ? "0 6px 14px -6px var(--dash-primary)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        {activeTab === "struktur" && <OfficialTab />}
        {activeTab === "sambutan" && <SpeechTab />}
        {activeTab === "agenda" && <EventTab />}
        {activeTab === "partner" && <PartnerTab />}
      </div>
    </div>
  );
}
