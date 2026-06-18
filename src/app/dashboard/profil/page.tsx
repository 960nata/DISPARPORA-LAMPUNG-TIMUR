"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Check, AlertTriangle, Shield, KeyRound } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Super Admin",
  admin_dinas: "Admin Dinas",
  admin_post: "Admin Post / Konten",
};

const ROLE_COLOR: Record<string, string> = {
  superadmin: "var(--dash-danger)",
  admin_dinas: "var(--dash-primary)",
  admin_post: "var(--dash-success)",
};

export default function ProfilPage() {
  const { user, setUser } = useAdmin();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName((user as any).name || "");
      setEmail((user as any).email || "");
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Masukkan password lama untuk konfirmasi");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          name: name.trim(),
          email: email.trim(),
          ...(newPassword ? { newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      // Update local session
      const updatedSession = { ...user, name: data.name, email: data.email };
      localStorage.setItem("admin_session", JSON.stringify(updatedSession));
      setUser(updatedSession as any);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Profil berhasil diperbarui");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleColor = ROLE_COLOR[user.role] ?? "var(--dash-primary)";
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", paddingBottom: "3rem" }}>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="dash-card"
        style={{ padding: "2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}
      >
        <div style={{
          width: "64px", height: "64px", borderRadius: "18px",
          background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: "1.5rem", flexShrink: 0,
          boxShadow: "0 12px 28px -10px var(--dash-primary)",
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--dash-text)" }}>{user.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: roleColor, background: `${roleColor}18`, padding: "2px 10px", borderRadius: "99px", border: `1px solid ${roleColor}30` }}>
              {roleLabel}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>@{user.username}</span>
          </div>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="dash-card"
        style={{ padding: "2rem" }}
      >
      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {/* Section: Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--dash-primary)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-primary)" }}>
              <User size={16} />
            </div>
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--dash-text)" }}>Informasi Akun</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="profil-grid">
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>NAMA LENGKAP</label>
              <input
                className="dash-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>EMAIL</label>
              <div style={{ position: "relative" }}>
                <input
                  className="dash-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  style={{ paddingLeft: "36px" }}
                />
                <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>USERNAME</label>
              <input
                className="dash-input"
                type="text"
                value={user.username}
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
              <p style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)", margin: "4px 0 0" }}>Username tidak dapat diubah</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>PERAN</label>
              <input
                className="dash-input"
                type="text"
                value={roleLabel}
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--dash-border)" }} />

        {/* Section: Password */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--dash-warning)18", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-warning)" }}>
              <Lock size={16} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--dash-text)" }}>Ubah Password</h2>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--dash-text-muted)" }}>Kosongkan jika tidak ingin mengubah password</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Old password — ALWAYS required */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>
                PASSWORD LAMA <span style={{ color: "var(--dash-danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="dash-input"
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama untuk konfirmasi"
                  style={{ paddingLeft: "36px", paddingRight: "44px" }}
                />
                <KeyRound size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
                <button type="button" onClick={() => setShowOld(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-muted)", display: "flex" }}>
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="profil-grid">
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>PASSWORD BARU</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="dash-input"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    style={{ paddingLeft: "36px", paddingRight: "44px" }}
                  />
                  <Lock size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-muted)" }} />
                  <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-muted)", display: "flex" }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-muted)", marginBottom: "6px", letterSpacing: "0.02em" }}>KONFIRMASI PASSWORD</label>
                <input
                  className="dash-input"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  style={newPassword && confirmPassword && newPassword !== confirmPassword ? { borderColor: "var(--dash-danger)" } : {}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.82rem", color: "var(--dash-danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.82rem", color: "var(--dash-success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={15} /> {success}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            className="dash-btn"
            style={{ padding: "11px 28px", fontSize: "0.88rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {saving ? "Menyimpan..." : <><Check size={16} /> Simpan Perubahan</>}
          </button>
        </div>
      </form>
      </motion.div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .profil-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
