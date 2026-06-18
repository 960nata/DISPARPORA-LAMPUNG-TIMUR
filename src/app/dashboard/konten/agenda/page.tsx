"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus, Edit2, Trash2, Save, Calendar, Clock, MapPin, Users } from "lucide-react";
import { Modal, DeleteModal, Field } from "../_shared";

interface Guest { name: string; initials: string; color: string; photoUrl?: string; }
interface AppEvent {
  id: string; title: string; date: string; time?: string;
  location: string; desc: string; status: "Mendatang" | "Selesai";
  image?: string; guests?: string;
}

const GUEST_COLORS = ["#6366f1","#10b981","#f59e0b","#ec4899","#0891b2","#8b5cf6","#ef4444","#14b8a6"];

function parseGuests(raw?: string): Guest[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function DashAvatar({ g }: { g: Guest }) {
  const [err, setErr] = useState(false);
  const showImg = g.photoUrl && !err;
  return (
    <div title={g.name} style={{ width: 28, height: 28, borderRadius: "50%", background: showImg ? "transparent" : g.color, border: "2px solid var(--dash-card)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {showImg
        ? <img src={g.photoUrl} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(true)} />
        : <span style={{ color: "#fff", fontSize: "0.58rem", fontWeight: 800 }}>{g.initials}</span>
      }
    </div>
  );
}

function AvatarStack({ guests }: { guests: Guest[] }) {
  const visible = guests.slice(0, 4);
  const extra = guests.length - 4;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((g, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, position: "relative", zIndex: visible.length - i }}>
          <DashAvatar g={g} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--dash-border-2)", color: "var(--dash-text-muted)", fontSize: "0.62rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--dash-card)", marginLeft: -8, flexShrink: 0 }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

function GuestEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [guests, setGuests]     = useState<Guest[]>(() => parseGuests(value));
  const [newName, setNewName]   = useState("");
  const [newPhoto, setNewPhoto] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sync = (list: Guest[]) => { setGuests(list); onChange(JSON.stringify(list)); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { setNewPhoto(reader.result as string); setUploading(false); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const initials = name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
    const color = GUEST_COLORS[guests.length % GUEST_COLORS.length];
    sync([...guests, { name, initials, color, photoUrl: newPhoto || undefined }]);
    setNewName(""); setNewPhoto("");
  };

  const remove = (i: number) => sync(guests.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* existing guests */}
      {guests.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {guests.map((g, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px 4px 5px", borderRadius: "99px", background: "var(--dash-bg)", border: "1px solid var(--dash-border)", fontSize: "0.78rem", fontWeight: 600 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: g.photoUrl ? "transparent" : g.color, overflow: "hidden", flexShrink: 0, border: "1px solid var(--dash-border)" }}>
                {g.photoUrl
                  ? <img src={g.photoUrl} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "0.52rem", fontWeight: 800 }}>{g.initials}</span></div>
                }
              </div>
              <span style={{ color: "var(--dash-text)" }}>{g.name}</span>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-danger)", lineHeight: 1, padding: 0, fontSize: "1rem", marginLeft: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* add new guest */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "12px", background: "var(--dash-bg)", border: "1px solid var(--dash-border)" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* foto preview / upload */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: "2px dashed var(--dash-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: newPhoto ? "transparent" : "var(--dash-card)", transition: "border-color 0.2s" }}
            title="Klik untuk upload foto"
          >
            {newPhoto
              ? <img src={newPhoto} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : uploading
                ? <span style={{ fontSize: "0.6rem", color: "var(--dash-text-muted)" }}>...</span>
                : <span style={{ fontSize: "1.2rem", color: "var(--dash-text-soft)" }}>+</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

          {/* nama */}
          <input className="dash-input" type="text" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Nama bintang tamu / narasumber" style={{ flex: 1 }} />

          <button onClick={add} disabled={!newName.trim()} type="button"
            style={{ padding: "0 14px", height: "38px", borderRadius: "9px", border: "none", background: "var(--dash-primary)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: newName.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", opacity: newName.trim() ? 1 : 0.5 }}>
            + Tambah
          </button>
        </div>
        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--dash-text-soft)" }}>Klik lingkaran untuk upload foto, lalu isi nama dan klik Tambah.</p>
      </div>
    </div>
  );
}

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

  const openAdd = () => setModal({ open: true, item: { title: "", date: "", time: "", location: "", desc: "", status: "Mendatang", image: "", guests: "" } });
  const openEdit = (item: AppEvent) => setModal({ open: true, item: { ...item } });

  const save = async () => {
    if (!modal.item) return;
    if (!modal.item.title?.trim() || !modal.item.date?.trim() || !modal.item.location?.trim()) {
      toast({ type: "error", title: "Judul, tanggal, dan lokasi wajib diisi." }); return;
    }
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
      setDel(null); load();
    } catch { toast({ type: "error", title: "Gagal menghapus" }); }
  };

  const setField = (key: keyof AppEvent, val: any) => setModal(m => ({ ...m, item: { ...m.item, [key]: val } }));

  const mendatang = items.filter(i => i.status === "Mendatang");
  const selesai   = items.filter(i => i.status === "Selesai");

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ padding: "6px 14px", borderRadius: "99px", background: "rgba(16,185,129,0.1)", color: "var(--dash-success)", fontSize: "0.78rem", fontWeight: 700 }}>
            {mendatang.length} Mendatang
          </div>
          <div style={{ padding: "6px 14px", borderRadius: "99px", background: "var(--dash-bg)", color: "var(--dash-text-muted)", fontSize: "0.78rem", fontWeight: 700 }}>
            {selesai.length} Selesai
          </div>
        </div>
        <button onClick={openAdd} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "0.875rem", borderRadius: "11px" }}>
          <Plus size={16} /> Tambah Event
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Memuat...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Belum ada event.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map(item => {
            const guests = parseGuests(item.guests);
            const statusColor = item.status === "Mendatang" ? "var(--dash-success)" : "var(--dash-text-muted)";
            const statusBg    = item.status === "Mendatang" ? "rgba(16,185,129,0.1)" : "var(--dash-bg)";
            return (
              <div key={item.id} className="dash-card" style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "1.125rem" }}>
                {item.image && (
                  <img src={item.image} alt={item.title}
                    style={{ width: "110px", height: "78px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, border: "1px solid var(--dash-border)" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: "99px", background: statusBg, color: statusColor }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--dash-text)", marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "4px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.76rem", color: "var(--dash-primary)", fontWeight: 600 }}>
                      <Calendar size={12} />{item.date}{item.time ? ` · ${item.time}` : ""}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.76rem", color: "var(--dash-text-muted)" }}>
                      <MapPin size={12} />{item.location}
                    </span>
                  </div>
                  {item.desc && (
                    <p style={{ fontSize: "0.78rem", color: "var(--dash-text-muted)", margin: "4px 0 6px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                      {item.desc}
                    </p>
                  )}
                  {guests.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <AvatarStack guests={guests} />
                      <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>
                        {guests[0].name}{guests.length > 1 ? ` +${guests.length - 1}` : ""}
                      </span>
                    </div>
                  )}
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
            );
          })}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false, item: null })} title={modal.item?.id ? "Edit Event" : "Tambah Event"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Judul Event *">
            <input className="dash-input" type="text" value={modal.item?.title ?? ""} onChange={e => setField("title", e.target.value)} placeholder="Nama event" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Field label="Tanggal *">
              <input className="dash-input" type="text" value={modal.item?.date ?? ""} onChange={e => setField("date", e.target.value)} placeholder="24 Oktober 2026" />
            </Field>
            <Field label="Jam">
              <input className="dash-input" type="text" value={modal.item?.time ?? ""} onChange={e => setField("time", e.target.value)} placeholder="10.00 WIB" />
            </Field>
          </div>
          <Field label="Lokasi *">
            <input className="dash-input" type="text" value={modal.item?.location ?? ""} onChange={e => setField("location", e.target.value)} placeholder="Nama tempat, kecamatan" />
          </Field>
          <Field label="Deskripsi">
            <textarea className="dash-input" rows={3} value={modal.item?.desc ?? ""} onChange={e => setField("desc", e.target.value)} placeholder="Deskripsi singkat event..." style={{ resize: "vertical" }} />
          </Field>
          <Field label="URL Gambar">
            <input className="dash-input" type="text" value={modal.item?.image ?? ""} onChange={e => setField("image", e.target.value)} placeholder="/Gallery/foto.avif atau https://..." />
          </Field>
          <Field label="Status">
            <select className="dash-input" value={modal.item?.status ?? "Mendatang"} onChange={e => setField("status", e.target.value)}>
              <option value="Mendatang">Mendatang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </Field>
          <Field label="Bintang Tamu / Narasumber">
            <GuestEditor value={modal.item?.guests ?? ""} onChange={v => setField("guests", v)} />
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
  if (!allowed) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
      <p style={{ fontWeight: 600 }}>Akses Ditolak</p>
      <p style={{ fontSize: "0.875rem" }}>Hanya superadmin dan admin_dinas.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "var(--font-main)" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.02em" }}>Agenda & Event</h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--dash-text-muted)" }}>Kelola agenda dan event yang ditampilkan di portal wisata.</p>
      </div>
      <div className="dash-card" style={{ padding: "1.5rem" }}>
        <EventContent />
      </div>
    </div>
  );
}
