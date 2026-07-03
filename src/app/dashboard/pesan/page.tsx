"use client";

import { useState, useEffect } from "react";
import {
  Mail, MailOpen, Search, Trash2, X, Inbox, RefreshCw,
  Reply, CheckCheck, Circle, User2, Clock, AtSign,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/contexts/ToastContext";

interface Message {
  id: string;
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  status: string; // "unread" | "read"
  createdAt: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PesanDashboardPage() {
  const { user } = useAdmin();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"all" | "unread">("all");
  const [active, setActive]     = useState<Message | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Message | null>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => toast({ type: "error", title: "Gagal memuat pesan" }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (!["superadmin", "admin_dinas"].includes(user?.role || "")) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--dash-text-muted)" }}>
        <Inbox size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
        <p>Akses ditolak.</p>
      </div>
    );
  }

  const unreadCount = messages.filter(m => m.status === "unread").length;

  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    const matchSearch =
      m.nama.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subjek.toLowerCase().includes(q) ||
      m.pesan.toLowerCase().includes(q);
    const matchFilter = filter === "all" || m.status === "unread";
    return matchSearch && matchFilter;
  });

  const setStatus = async (m: Message, status: "read" | "unread") => {
    if (m.status === status) return;
    // optimistic
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status } : x));
    setActive(prev => prev && prev.id === m.id ? { ...prev, status } : prev);
    try {
      const res = await fetch(`/api/messages/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // revert on failure
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: m.status } : x));
      toast({ type: "error", title: "Gagal memperbarui status" });
    }
  };

  const openMessage = (m: Message) => {
    setActive(m);
    if (m.status === "unread") setStatus(m, "read");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const target = deleteConfirm;
    try {
      const res = await fetch(`/api/messages/${target.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessages(prev => prev.filter(x => x.id !== target.id));
      if (active?.id === target.id) setActive(null);
      toast({ type: "success", title: "Dihapus!", message: `Pesan dari ${target.nama} dihapus.` });
    } catch {
      toast({ type: "error", title: "Gagal menghapus pesan" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const stat = (label: string, value: number, accent: string) => (
    <div className="dash-card" style={{ padding: "1rem 1.25rem", flex: 1, minWidth: "130px" }}>
      <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div className="dash-page-header">
        <div>
          <p style={{ margin: 0, fontSize: "0.66rem", fontWeight: 700, color: "var(--dash-primary)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Kotak Masuk</p>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-text)", display: "flex", alignItems: "center", gap: "10px" }}>
            Pesan Masuk
            {unreadCount > 0 && (
              <span className="dash-badge dash-badge-danger" style={{ fontSize: "0.72rem" }}>{unreadCount} baru</span>
            )}
          </h1>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--dash-text-muted)" }}>
            Pesan dari form kontak publik website.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {stat("Total Pesan", messages.length, "var(--dash-text)")}
        {stat("Belum Dibaca", unreadCount, "var(--dash-danger)")}
        {stat("Sudah Dibaca", messages.length - unreadCount, "var(--dash-success)")}
      </div>

      {/* Toolbar */}
      <div className="dash-toolbar">
        <div className="dash-toolbar-search" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
          <input className="dash-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, email, subjek, atau isi pesan..." style={{ paddingLeft: "36px", width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: "4px", background: "var(--dash-surface-hover)", padding: "4px", borderRadius: "10px", border: "1px solid var(--dash-border)" }}>
          {([["all", "Semua"], ["unread", "Belum Dibaca"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
                background: filter === key ? "var(--dash-primary)" : "transparent",
                color: filter === key ? "#fff" : "var(--dash-text-muted)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh", gap: "0.5rem", color: "var(--dash-text-muted)" }}>
          <RefreshCw size={18} style={{ animation: "spin 1s linear infinite", color: "var(--dash-primary)" }} /> Memuat pesan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-card" style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--dash-text-muted)" }}>
          <Inbox size={40} style={{ opacity: 0.25, marginBottom: "0.75rem" }} />
          <p style={{ margin: 0, fontWeight: 700 }}>{messages.length === 0 ? "Belum ada pesan masuk." : "Tidak ada pesan yang cocok."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(m => {
            const unread = m.status === "unread";
            return (
              <div key={m.id} onClick={() => openMessage(m)} className="dash-card dash-card-hover"
                style={{ padding: "1rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px",
                  borderLeft: unread ? "3px solid var(--dash-primary)" : "3px solid transparent" }}>
                <div style={{ flexShrink: 0, color: unread ? "var(--dash-primary)" : "var(--dash-text-muted)" }}>
                  {unread ? <Mail size={20} /> : <MailOpen size={20} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: unread ? 800 : 600, color: "var(--dash-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.nama}</span>
                    {unread && <Circle size={7} fill="var(--dash-primary)" color="var(--dash-primary)" style={{ flexShrink: 0 }} />}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: unread ? 700 : 500, color: "var(--dash-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.subjek}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "var(--dash-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.pesan}</p>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)", whiteSpace: "nowrap" }}>{formatDate(m.createdAt)}</span>
                  <button onClick={e => { e.stopPropagation(); setDeleteConfirm(m); }} title="Hapus"
                    style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "5px", cursor: "pointer", color: "var(--dash-danger)", display: "flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {active && (
        <div onClick={() => setActive(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} className="dash-card" style={{ width: "100%", maxWidth: "560px", maxHeight: "88vh", overflowY: "auto", padding: 0 }}>
            {/* Modal header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--dash-text)", wordBreak: "break-word" }}>{active.subjek}</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px", fontSize: "0.8rem", color: "var(--dash-text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><User2 size={13} /> {active.nama}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", wordBreak: "break-all" }}><AtSign size={13} /> {active.email}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Clock size={13} /> {formatDate(active.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => setActive(null)} style={{ background: "none", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "var(--dash-text-muted)", display: "flex", flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: "1.5rem", fontSize: "0.9rem", lineHeight: 1.75, color: "var(--dash-text)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {active.pesan}
            </div>
            {/* Actions */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--dash-border)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <a href={`mailto:${active.email}?subject=${encodeURIComponent("Re: " + active.subjek)}`}
                className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", textDecoration: "none" }}>
                <Reply size={14} /> Balas via Email
              </a>
              <button onClick={() => setStatus(active, active.status === "unread" ? "read" : "unread")}
                className="dash-btn dash-btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px" }}>
                {active.status === "unread" ? <><CheckCheck size={14} /> Tandai Dibaca</> : <><Mail size={14} /> Tandai Belum Dibaca</>}
              </button>
              <button onClick={() => setDeleteConfirm(active)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1px solid var(--dash-danger)", background: "transparent", color: "var(--dash-danger)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", marginLeft: "auto" }}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} className="dash-card" style={{ width: "100%", maxWidth: "380px", padding: "1.5rem", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--dash-danger-bg, rgba(239,68,68,0.1))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Trash2 size={22} style={{ color: "var(--dash-danger)" }} />
            </div>
            <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem", fontWeight: 800, color: "var(--dash-text)" }}>Hapus Pesan?</h3>
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "var(--dash-text-muted)" }}>
              Pesan dari <strong>{deleteConfirm.nama}</strong> akan dihapus permanen.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteConfirm(null)} className="dash-btn dash-btn-secondary" style={{ flex: 1, padding: "10px" }}>Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "var(--dash-danger)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
