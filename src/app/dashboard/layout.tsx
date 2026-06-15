"use client";

import { useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, MapPin, FileText, Users, Map, LogOut,
  ChevronRight, Globe, Menu, X, Plus,
  ArrowLeft, Search, Bell, Sun, Moon, Images
} from "lucide-react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

/* ─── Clean Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const { theme } = useTheme();
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
      backgroundColor: "var(--dash-bg)", padding: "24px"
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--dash-primary-bg)", marginBottom: "16px" }}>
            <img src="/logo.avif" alt="Logo" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Forum Investasi Lampung</h1>
          <p style={{ color: "var(--dash-text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            Masuk ke Panel Admin
          </p>
        </div>

        {/* Form */}
        <div style={{ backgroundColor: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "12px", padding: "24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Username</label>
              <input className="dash-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" required autoComplete="username" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text-soft)", marginBottom: "6px" }}>Password</label>
              <input className="dash-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--dash-danger-bg)", fontSize: "0.8rem", color: "var(--dash-danger)", fontWeight: 500 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="dash-btn" style={{ padding: "10px", width: "100%", fontSize: "0.875rem" }}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--dash-border)", marginTop: "20px", paddingTop: "16px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--dash-text-muted)", textAlign: "center", marginBottom: "10px" }}>
              Quick Access (Dev)
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["superadmin","Super"],["admin_dinas","Dinas"],["admin_post","Post"]].map(([r, l]) => (
                <button key={r} onClick={() => quickLogin(r)} disabled={!!quickLoading} className="dash-btn dash-btn-secondary" style={{ flex: 1, fontSize: "0.75rem", padding: "6px" }}>
                  {quickLoading === r ? "..." : l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px", fontSize: "0.8rem", color: "var(--dash-text-muted)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Kembali ke Portal
        </Link>
      </div>
    </div>
  );
}

/* ─── Navigation Config ─── */
const NAV = [
  { section: "MENU", items: [
    { href: "/dashboard",           label: "Ringkasan",          icon: LayoutDashboard, roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "KELOLA", items: [
    { href: "/dashboard/destinasi", label: "Proyek Investasi",   icon: MapPin,          roles: ["superadmin","admin_dinas"] },
    { href: "/dashboard/berita",    label: "Publikasi Berita",   icon: FileText,        roles: ["superadmin","admin_dinas","admin_post"] },
    { href: "/dashboard/galeri",    label: "Galeri Foto",        icon: Images,          roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "SISTEM", items: [
    { href: "/dashboard/pengguna",  label: "Manajemen Akun",     icon: Users,           roles: ["superadmin"] },
  ]},
];

const CRUMBS: Record<string, string> = {
  "/dashboard":             "Ringkasan",
  "/dashboard/destinasi":   "Proyek Investasi",
  "/dashboard/berita":      "Publikasi Berita",
  "/dashboard/berita/buat": "Buat Artikel",
  "/dashboard/galeri":      "Galeri Foto",
  "/dashboard/pengguna":    "Manajemen Akun",
};

/* ─── Main Shell Component ─── */
function DashboardShell({ children }: { children: ReactNode }) {
  const { user, setUser, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const crumb = CRUMBS[pathname] ?? "Dashboard";
  const isNewsEditor = pathname.startsWith("/dashboard/berita/buat");

  const handleLogout = () => { logout(); router.push("/dashboard"); };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--dash-bg)", color: "var(--dash-text)", display: "flex", fontFamily: "var(--font-main)" }}>

      {/* ══ SIDEBAR ══ */}
      <aside className={`dash-sidebar${sideOpen ? " open" : ""}`} style={{
        width: "240px", backgroundColor: "var(--dash-sidebar)", flexShrink: 0,
        borderRight: "1px solid var(--dash-border)", display: "flex", flexDirection: "column",
        overflowY: "auto", height: "100vh", position: "sticky", top: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--dash-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src="/logo.avif" alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--dash-text)" }}>FILA Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px" }}>
          {NAV.map(group => {
            const visible = group.items.filter(i => i.roles.includes(user.role));
            if (!visible.length) return null;
            return (
              <div key={group.section}>
                <p className="dash-nav-label">{group.section}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
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
              </div>
            );
          })}

          <div style={{ margin: "16px 4px", borderTop: "1px solid var(--dash-border)" }} />

          <p className="dash-nav-label">TAUTAN</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <a href="/peta" target="_blank" rel="noreferrer" className="dash-nav-item">
              <Map size={16} className="dash-nav-icon" /> Peta Interaktif
            </a>
            <a href="/" target="_blank" rel="noreferrer" className="dash-nav-item">
              <Globe size={16} className="dash-nav-icon" /> Portal Investasi
            </a>
          </div>
        </nav>

        {/* User card */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--dash-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--dash-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--dash-primary)", fontSize: "0.8rem", flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--dash-text-muted)", textTransform: "capitalize" }}>{user.role.replace("_"," ")}</p>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer", padding: "4px", borderRadius: "4px", display: "flex" }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ══ TOP HEADER ══ */}
        <header style={{
          height: "48px", flexShrink: 0, position: "sticky", top: 0, zIndex: 200,
          borderBottom: "1px solid var(--dash-border)",
          backgroundColor: "var(--dash-surface)",
          display: "flex", alignItems: "center", gap: "12px", padding: "0 20px",
        }}>
          {/* Mobile Toggle */}
          <button onClick={() => setSideOpen(v => !v)} className="dash-mob-toggle" style={{ background: "none", border: "1px solid var(--dash-border)", color: "var(--dash-text)", cursor: "pointer", display: "none", padding: "6px", borderRadius: "6px" }}>
            {sideOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }} className="desktop-breadcrumb">
            <span style={{ color: "var(--dash-text-muted)", fontWeight: 500 }}>Dashboard</span>
            {crumb !== "Ringkasan" && (
              <>
                <ChevronRight size={12} style={{ color: "var(--dash-text-muted)", opacity: 0.5 }} />
                <span style={{ color: "var(--dash-text)", fontWeight: 600 }}>{crumb}</span>
              </>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Create shortcut */}
            {!isNewsEditor && (
              <Link href="/dashboard/berita/buat" style={{ textDecoration: "none" }}>
                <button className="dash-btn" style={{ padding: "5px 12px", fontSize: "0.78rem" }}>
                  <Plus size={14} /> Tulis
                </button>
              </Link>
            )}

            {/* Theme toggle */}
            <button onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"} style={{
              background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px",
              color: "var(--dash-text-muted)", cursor: "pointer", padding: "5px", display: "flex", alignItems: "center",
              transition: "background 0.15s"
            }}>
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Notifications */}
            <button style={{
              background: "none", border: "1px solid var(--dash-border)", borderRadius: "6px",
              color: "var(--dash-text-muted)", cursor: "pointer", padding: "5px", display: "flex",
              alignItems: "center", position: "relative"
            }}>
              <Bell size={15} />
              <span style={{ position: "absolute", top: "3px", right: "3px", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--dash-danger)" }} />
            </button>

            {/* Portal link */}
            <a href="/" target="_blank" rel="noreferrer" className="desktop-portal-btn" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--dash-text-muted)", padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--dash-border)", textDecoration: "none" }}>
              <Globe size={13} /> Portal
            </a>

            {/* User mini badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid var(--dash-border)", paddingLeft: "12px", marginLeft: "4px" }} className="header-user-badge">
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--dash-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--dash-primary)", fontSize: "0.72rem" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="dash-user-info">
                <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text)" }}>{user.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="dash-main">
          {children}
        </main>
      </div>

      {/* ══ RESPONSIVE STYLES ══ */}
      <style jsx global>{`
        .dash-sidebar { transition: transform 0.2s ease; }
        .dash-main { height: calc(100vh - 48px); }

        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            z-index: 300; transform: translateX(-100%);
            width: 240px;
          }
          .dash-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
          .dash-mob-toggle { display: flex !important; }
          .dash-user-info { display: none; }
          .dash-main { padding: 16px !important; }
          .desktop-breadcrumb, .desktop-portal-btn { display: none !important; }
          .header-user-badge { border-left: none !important; padding-left: 0 !important; margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .dash-mob-toggle { display: none !important; }
        }
        @media (max-width: 900px) {
          .grid-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Root Export ─── */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <ThemeProvider>
        <DashboardShell>{children}</DashboardShell>
      </ThemeProvider>
    </AdminProvider>
  );
}
