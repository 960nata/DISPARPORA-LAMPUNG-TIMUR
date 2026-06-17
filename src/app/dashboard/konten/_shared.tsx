"use client";

import { useState, useRef, ChangeEvent } from "react";
import { X, Save, Upload } from "lucide-react";

/* ─── Types ─── */
export interface Official {
  id: string;
  name: string;
  title: string;
  role: string;
  photoUrl?: string;
  order: number;
}

export interface Speech {
  id: string;
  name: string;
  title: string;
  badge: string;
  photoUrl: string;
  welcomeSpeech: string;
  order: number;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  status: "Mendatang" | "Selesai";
  image?: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

/* ─── Shared Modal ─── */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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
export function DeleteModal({ open, onClose, onConfirm, label }: { open: boolean; onClose: () => void; onConfirm: () => void; label: string }) {
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
export function PhotoUploadField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
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
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}
