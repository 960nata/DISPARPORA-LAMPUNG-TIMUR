"use client";

import { useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, MapPin, FileText, Users, Map, LogOut,
  ChevronRight, Globe, ShieldCheck, Menu, X, Plus,
  ArrowLeft
} from "lucide-react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";

/* ─── Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState("");

  const doLogin = async (u: string, p: string) => {
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      localStorage.setItem("admin_session", JSON.stringify(data));
      onLogin(data);
    } catch (err: any) { setError(err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await doLogin(username, password);
    setLoading(false);
  };

  const quickLogin = async (role: string) => {
    const creds: Record<string, [string,string]> = {
      superadmin:  ["superadmin",  "password123"],
      admin_dinas: ["admindinas",  "password123"],
      admin_post:  ["adminpost",   "password123"],
    };
    setQuickLoading(role);
    await doLogin(...creds[role]);
    setQuickLoading("");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 20% 50%, #0d1a35 0%, var(--dash-bg) 60%)",
      padding: "1.5rem", position: "relative", overflow: "hidden"
    }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.1) 100%)", border: "1px solid rgba(99,102,241,0.3)", marginBottom: "1rem" }}>
            <img src="/logo.avif" alt="Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.02em", margin: 0 }}>SIMAD</h1>
          <p style={{ color: "var(--dash-text-muted)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
            Disparpora Kabupaten Lampung Timur
          </p>
        </div>

        {/* Card */}
        <div className="dash-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Username</label>
              <input className="dash-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username..." required autoComplete="username" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--dash-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Password</label>
              <input className="dash-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ padding: "0.65rem 0.875rem", borderRadius: "8px", background: "var(--dash-danger-glow)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.8rem", color: "#f87171" }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="dash-btn" style={{ marginTop: "0.25rem", padding: "0.75rem" }}>
              {loading ? "Memproses..." : "Masuk ke SIMAD"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "1.25rem" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--dash-text-muted)", textAlign: "center", marginBottom: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6 }}>
              Dev Quick Access
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[["superadmin","Superadmin"],["admin_dinas","Dinas"],["admin_post","Post"]].map(([r, l]) => (
                <button key={r} onClick={() => quickLogin(r)} disabled={!!quickLoading} className="dash-btn" style={{ flex: 1, fontSize: "0.7rem", padding: "0.45rem 0.3rem", background: "rgba(255,255,255,0.04)", border: "1px solid var(--dash-border-2)", boxShadow: "none", color: "var(--dash-text-soft)" }}>
                  {quickLoading === r ? "..." : l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--dash-text-muted)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Kembali ke Portal Publik
        </Link>
      </div>
    </div>
  );
}

/* ─── Nav Config ─── */
const NAV = [
  { section: "PORTAL",  items: [
    { href: "/dashboard",           label: "Ringkasan",    icon: LayoutDashboard, roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "KONTEN", items: [
    { href: "/dashboard/destinasi", label: "Destinasi",    icon: MapPin,          roles: ["superadmin","admin_dinas"] },
    { href: "/dashboard/berita",    label: "CMS Berita",   icon: FileText,        roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "ADMIN",  items: [
    { href: "/dashboard/pengguna",  label: "Pengguna",     icon: Users,           roles: ["superadmin"] },
  ]},
];

const CRUMBS: Record<string, string> = {
  "/dashboard":             "Ringkasan",
  "/dashboard/destinasi":   "Destinasi",
  "/dashboard/berita":      "CMS Berita",
  "/dashboard/berita/buat": "Buat Artikel",
  "/dashboard/pengguna":    "Pengguna",
};

/* ─── Dashboard Shell ─── */
function DashboardShell({ children }: { children: ReactNode }) {
  const { user, setUser, logout } = useAdmin();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const crumb = CRUMBS[pathname] ?? "Dashboard";
  const isNewsEditor = pathname.startsWith("/dashboard/berita/buat");

  const handleLogout = () => { logout(); router.push("/dashboard"); };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--dash-bg)", color: "var(--dash-text)", display: "flex", flexDirection: "column", fontFamily: "var(--font-main)" }}>

      {/* ══ TOP HEADER ══ */}
      <header style={{
        height: "56px", flexShrink: 0, position: "sticky", top: 0, zIndex: 200,
        borderBottom: "1px solid var(--dash-border)",
        background: "rgba(4,7,15,0.82)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 1.25rem",
      }}>
        {/* Mobile toggle */}
        <button onClick={() => setSideOpen(v => !v)} className="dash-mob-toggle" style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", display: "none", padding: "0.25rem" }}>
          {sideOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.15))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo.avif" alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "0.875rem", color: "white", letterSpacing: "-0.01em" }}>SIMAD</span>
        </Link>

        {/* Divider */}
        <div style={{ width: "1px", height: "16px", backgroundColor: "var(--dash-border-2)", flexShrink: 0 }} />

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
          <span style={{ color: "var(--dash-text-muted)" }}>Dashboard</span>
          {crumb !== "Ringkasan" && (
            <>
              <ChevronRight size={13} style={{ color: "var(--dash-text-muted)", opacity: 0.5 }} />
              <span style={{ color: "var(--dash-text-soft)", fontWeight: 600 }}>{crumb}</span>
            </>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Quick create (editor pages) */}
        {!isNewsEditor && (
          <Link href="/dashboard/berita/buat" style={{ textDecoration: "none" }}>
            <button className="dash-btn" style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Plus size={13} /> Artikel
            </button>
          </Link>
        )}

        {/* Portal link */}
        <a href="/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--dash-text-muted)", padding: "0.4rem 0.65rem", borderRadius: "7px", border: "1px solid var(--dash-border-2)", textDecoration: "none", transition: "all 0.15s", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <Globe size={13} /> Portal
        </a>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: "0.75rem" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.25 }} className="dash-user-info">
            <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text)" }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: "0.62rem", color: "var(--dash-text-muted)", textTransform: "capitalize" }}>{user.role.replace("_"," ")}</p>
          </div>
        </div>

        <button onClick={handleLogout} title="Logout" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "7px", color: "#f87171", cursor: "pointer", padding: "0.4rem 0.5rem", display: "flex", alignItems: "center", transition: "all 0.15s" }}
          onMouseOver={e => (e.currentTarget.style.background = "rgba(239,68,68,0.16)") }
          onMouseOut={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)") }>
          <LogOut size={15} />
        </button>
      </header>

      {/* ══ BODY ══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ══ SIDEBAR ══ */}
        <aside className={`dash-sidebar${sideOpen ? " open" : ""}`} style={{
          width: "220px", backgroundColor: "var(--dash-sidebar)", flexShrink: 0,
          borderRight: "1px solid var(--dash-border)", display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}>
          {/* Nav */}
          <nav style={{ flex: 1, padding: "0.75rem 0.75rem 0" }}>
            {NAV.map(group => {
              const visible = group.items.filter(i => i.roles.includes(user.role));
              if (!visible.length) return null;
              return (
                <div key={group.section}>
                  <p className="dash-nav-label">{group.section}</p>
                  {visible.map(item => {
                    const Icon = item.icon;
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                        className={`dash-nav-item${active ? " active" : ""}`}>
                        <Icon size={16} className="dash-nav-icon" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {/* Divider */}
            <div style={{ margin: "0.875rem 0.875rem", borderTop: "1px solid var(--dash-border)" }} />

            {/* External links */}
            <a href="/peta" target="_blank" rel="noreferrer" className="dash-nav-item">
              <Map size={16} className="dash-nav-icon" /> Peta Wisata
            </a>
            <a href="/" target="_blank" rel="noreferrer" className="dash-nav-item">
              <Globe size={16} className="dash-nav-icon" /> Lihat Portal
            </a>
          </nav>

          {/* User card at bottom */}
          <div style={{ padding: "0.875rem", borderTop: "1px solid var(--dash-border)", flexShrink: 0 }}>
            <div style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--dash-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: "0.8rem", flexShrink: 0 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.1rem" }}>
                    <ShieldCheck size={10} style={{ color: "var(--dash-primary)" }} />
                    <span style={{ fontSize: "0.62rem", color: "var(--dash-primary)", fontWeight: 700, textTransform: "capitalize" }}>{user.role.replace("_"," ")}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: "100%", padding: "0.45rem", borderRadius: "7px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", color: "#f87171", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
                <LogOut size={12} /> Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex: 1, overflowY: "auto", padding: "1.75rem" }} className="dash-main dash-scroll">
          {children}
        </main>
      </div>

      {/* ══ GLOBAL STYLES ══ */}
      <style jsx global>{`
        body { background-color: var(--dash-bg) !important; overflow: hidden; }
        .dash-sidebar { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
        .dash-main { height: calc(100vh - 56px); }

        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed; top: 56px; left: 0; bottom: 0;
            z-index: 150; transform: translateX(-100%);
          }
          .dash-sidebar.open { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,0.6); }
          .dash-mob-toggle { display: flex !important; }
          .dash-user-info { display: none; }
          .dash-main { padding: 1.25rem !important; }
        }
        @media (min-width: 769px) {
          .dash-mob-toggle { display: none !important; }
        }
        @media (max-width: 900px) {
          .grid-charts { grid-template-columns: 1fr !important; }
          .grid-charts-loader { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Root Export ─── */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdminProvider>
  );
}
