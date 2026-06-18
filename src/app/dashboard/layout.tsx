"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, MapPin, FileText, Users, LogOut,
  Menu, X, ArrowLeft, Bell, Sun, Moon, Images, User,
  Building2, Mic2, CalendarDays, Handshake, TrendingUp
} from "lucide-react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastStack from "@/components/admin/ToastStack";

/* ─── Split Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      localStorage.setItem("admin_session", JSON.stringify(data));
      onLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell" style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--font-main)" }}>

      {/* ── LEFT: Branding panel ── */}
      <div className="login-brand-panel" style={{
        flex: "1 1 55%", position: "relative", overflow: "hidden",
        backgroundImage: "linear-gradient(160deg, rgba(5,46,35,0.97) 0%, rgba(6,78,59,0.85) 50%, rgba(5,46,35,0.75) 100%), url('/Gallery/hero1.avif')",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px",
      }}>
        {/* Dot grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Top logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <img src="/logo.avif" alt="Logo" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>DISPARPORA</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Lampung Timur</div>
          </div>
        </div>

        {/* Bottom content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(190,242,106,0.15)", border: "1px solid rgba(190,242,106,0.35)", borderRadius: "99px", padding: "5px 14px", marginBottom: "20px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#BEF26A", display: "inline-block" }} />
            <span style={{ color: "#BEF26A", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>SISTEM INFORMASI MANAJEMEN</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "white", lineHeight: 1.15, margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
            Panel Admin<br />DISPARPORA
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 2rem", maxWidth: "400px" }}>
            Kelola destinasi wisata, berita, galeri, dan program kerja Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {[["71+", "Destinasi"], ["500+", "Pelaku Ekraf"], ["2.000+", "Pemuda"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "white" }}>{v}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form panel ── */}
      <div className="login-form-panel" style={{
        flex: "0 0 420px", display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", padding: "48px 40px",
        background: "var(--dash-bg)", borderLeft: "1px solid var(--dash-border)",
      }}>
        <div style={{ width: "100%", maxWidth: "340px" }}>

          {/* Logo mobile (hidden on desktop) */}
          <div className="login-mobile-logo" style={{ display: "none", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0E9F4F, #065f46)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo.avif" alt="Logo" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--dash-text)" }}>DISPARPORA</div>
              <div style={{ fontSize: "0.68rem", color: "var(--dash-text-muted)" }}>Lampung Timur</div>
            </div>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--dash-text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Masuk ke Akun</h2>
          <p style={{ color: "var(--dash-text-muted)", fontSize: "0.85rem", margin: "0 0 32px" }}>
            Masukkan kredensial Anda untuk mengakses panel admin.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "7px", letterSpacing: "0.02em" }}>EMAIL</label>
              <input
                className="dash-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@domain.com"
                required
                autoComplete="email"
                style={{ fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--dash-text-soft)", marginBottom: "7px", letterSpacing: "0.02em" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  className="dash-input"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ fontSize: "0.9rem", paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-muted)", padding: "4px", display: "flex" }}
                >
                  {showPw ? <X size={16} /> : <User size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.82rem", color: "var(--dash-danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="dash-btn"
              style={{ padding: "13px", width: "100%", fontSize: "0.9rem", borderRadius: "12px", fontWeight: 700, marginTop: "4px" }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--dash-border)", textAlign: "center" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--dash-text-muted)", textDecoration: "none", fontWeight: 600 }}>
              <ArrowLeft size={14} /> Kembali ke Portal
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .login-brand-panel { display: none !important; }
          .login-form-panel { flex: 1 1 100% !important; border-left: none !important; padding: 32px 24px !important; }
          .login-mobile-logo { display: flex !important; }
        }
        .login-shell input[type="text"],
        .login-shell input[type="password"] {
          width: 100%;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

/* ─── Navigation Config ─── */
const NAV = [
  { section: "MENU UTAMA", items: [
    { href: "/dashboard",           label: "Dashboard",          icon: LayoutDashboard, roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "KELOLA", items: [
    { href: "/dashboard/destinasi", label: "Destinasi Wisata",   icon: MapPin,          roles: ["superadmin","admin_dinas"] },
    { href: "/dashboard/berita",    label: "Berita & Artikel",   icon: FileText,        roles: ["superadmin","admin_dinas","admin_post"] },
    { href: "/dashboard/galeri",    label: "Galeri Foto",        icon: Images,          roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
  { section: "KONTEN", items: [
    { href: "/dashboard/konten/organisasi", label: "Struktur Organisasi", icon: Building2,    roles: ["superadmin", "admin_dinas"] },
    { href: "/dashboard/konten/sambutan",   label: "Sambutan",            icon: Mic2,         roles: ["superadmin", "admin_dinas"] },
    { href: "/dashboard/konten/agenda",     label: "Agenda & Event",      icon: CalendarDays, roles: ["superadmin", "admin_dinas"] },
    { href: "/dashboard/konten/partner",    label: "Partner Kami",        icon: Handshake,    roles: ["superadmin", "admin_dinas"] },
  ]},
  { section: "STATISTIK", items: [
    { href: "/dashboard/wisatawan", label: "Pertumbuhan Wisatawan", icon: TrendingUp,    roles: ["superadmin","admin_dinas"] },
  ]},
  { section: "SISTEM", items: [
    { href: "/dashboard/pengguna",  label: "Manajemen Akun",     icon: Users,           roles: ["superadmin"] },
    { href: "/dashboard/profil",    label: "Profil Saya",        icon: User,            roles: ["superadmin","admin_dinas","admin_post"] },
  ]},
];

const CRUMBS: Record<string, string> = {
  "/dashboard":                          "Dashboard",
  "/dashboard/destinasi":                "Destinasi Wisata",
  "/dashboard/berita":                   "Berita & Artikel",
  "/dashboard/berita/buat":              "Tulis Artikel",
  "/dashboard/galeri":                   "Galeri Foto",
  "/dashboard/konten":                   "Manajemen Konten",
  "/dashboard/konten/organisasi":        "Struktur Organisasi",
  "/dashboard/konten/sambutan":          "Sambutan Kepala Daerah",
  "/dashboard/konten/agenda":            "Agenda & Event",
  "/dashboard/konten/partner":           "Partner Kami",
  "/dashboard/wisatawan":                "Pertumbuhan Wisatawan",
  "/dashboard/pengguna":                 "Manajemen Akun",
  "/dashboard/profil":                   "Profil Saya",
};

/* ─── Main Shell Component ─── */
function DashboardShell({ children }: { children: ReactNode }) {
  const { user, setUser, logout } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closePopups = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", closePopups);
    return () => document.removeEventListener("mousedown", closePopups);
  }, []);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const crumb = CRUMBS[pathname] ?? "Dashboard";

  const notifications = [
    { title: "Laporan harian tersedia", detail: "Ringkasan performa portal siap dilihat." },
    { title: "Review konten baru", detail: "1 artikel menunggu persetujuan editor." },
    { title: "Destinasi diperbarui", detail: "Data 5 destinasi wisata telah diperbarui." },
  ];

  const handleLogout = () => { logout(); router.push("/dashboard"); };

  const navItemBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "13px",
    padding: "11px 13px", borderRadius: "13px", textDecoration: "none",
    fontSize: "0.875rem", fontWeight: 600,
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", backgroundColor: "var(--dash-bg)", color: "var(--dash-text)", display: "flex", fontFamily: "var(--font-main)", WebkitFontSmoothing: "antialiased" }}>

      {/* ══ SIDEBAR ══ */}
      <aside className={`dash-sidebar${sideOpen ? " open" : ""}`} style={{
        width: "264px", backgroundColor: "var(--dash-sidebar)", flexShrink: 0,
        borderRight: "1px solid var(--dash-border)", display: "flex", flexDirection: "column",
        gap: "4px", padding: "22px 18px",
        overflowY: "auto", height: "100vh",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 6px 18px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "13px", background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 20px -8px var(--dash-primary)" }}>
            <img src="/logo.avif" alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--dash-text)", letterSpacing: "-0.01em" }}>DISPARPORA Lampung Timur</div>
            <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--dash-primary)", letterSpacing: "0.04em" }}>PANEL ADMIN</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map(group => {
            const visible = group.items.filter(i => i.roles.includes(user.role));
            if (!visible.length) return null;
            return (
              <div key={group.section}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.09em", color: "var(--dash-text-muted)", padding: "14px 8px 6px" }}>{group.section}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {visible.map(item => {
                    const Icon = item.icon;
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                        className={active ? "" : "dash-nav-soft"}
                        style={active ? {
                          ...navItemBase,
                          background: "var(--dash-primary)", color: "#fff",
                          boxShadow: "0 10px 22px -12px var(--dash-primary)",
                        } : {
                          ...navItemBase,
                          background: "transparent", color: "var(--dash-text-soft)",
                        }}>
                        <Icon size={19} style={{ flexShrink: 0 }} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </nav>

        {/* Profile card */}
        <div style={{ marginTop: "8px", borderTop: "1px solid var(--dash-border)", paddingTop: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "12px", borderRadius: "14px", background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0, boxShadow: "0 6px 14px -6px var(--dash-primary)" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.25, minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: "0.69rem", fontWeight: 600, color: "var(--dash-primary)", textTransform: "capitalize", marginTop: "1px" }}>{user.role.replace(/_/g," ")}</div>
            </div>
            <button onClick={handleLogout} title="Keluar" style={{ background: "none", border: "1px solid var(--dash-border)", color: "var(--dash-text-muted)", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex", flexShrink: 0 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ══ TOP HEADER ══ */}
        <header ref={headerRef} style={{
          position: "sticky", top: 0, zIndex: 200,
          borderBottom: "1px solid var(--dash-border)",
          backgroundColor: "var(--dash-surface)",
          backdropFilter: "saturate(1.4) blur(8px)",
          padding: "12px 20px",
          display: "flex", alignItems: "center", gap: "10px",
          flexShrink: 0,
        }}>
          {/* Hamburger — mobile only */}
          <button onClick={() => setSideOpen(v => !v)} className="dash-mob-toggle" style={{ background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)", color: "var(--dash-text)", cursor: "pointer", display: "none", padding: "8px", borderRadius: "10px", flexShrink: 0 }}>
            {sideOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Page title breadcrumb */}
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--dash-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{crumb}</span>

          {/* Theme toggle — icon only */}
          <button onClick={toggleTheme} title={theme === "light" ? "Mode Gelap" : "Mode Terang"} className="dash-header-btn" style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} style={{ color: "var(--dash-warning)" }} />}
          </button>

          {/* Bell notification */}
          <button onClick={() => { setNotificationOpen(v => !v); setProfileOpen(false); }} style={{ position: "relative", width: "40px", height: "40px", borderRadius: "10px", border: "1px solid var(--dash-border)", background: "var(--dash-surface-hover)", color: "var(--dash-text-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="Notifikasi">
            <Bell size={17} />
            <span style={{ position: "absolute", top: "7px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--dash-danger)", border: "2px solid var(--dash-surface)" }} />
          </button>

          {/* Profile avatar — icon only */}
          <button onClick={() => { setProfileOpen(v => !v); setNotificationOpen(false); }} title={user.name} aria-haspopup="true" aria-expanded={profileOpen} style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))", border: "none", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </button>

          {/* Profile popup */}
          {profileOpen && (
            <div className="dash-popup-panel" style={{ position: "absolute", right: "20px", top: "66px", zIndex: 210, width: "220px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "16px", padding: "8px", boxShadow: "0 24px 48px -24px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 10px 12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, var(--dash-primary), var(--dash-success))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.82rem", flexShrink: 0 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--dash-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--dash-text-muted)", textTransform: "capitalize" }}>{user.role.replace("_"," ")}</div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--dash-border)", margin: "0 2px 6px" }} />
              <Link href="/dashboard/profil" onClick={() => setProfileOpen(false)} className="dash-menu-item" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 10px", borderRadius: "10px", textDecoration: "none", color: "var(--dash-text)", fontWeight: 600, fontSize: "0.84rem" }}>
                <User size={15} style={{ color: "var(--dash-text-muted)" }} /> Profil Saya
              </Link>
              <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="dash-menu-item" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 10px", borderRadius: "10px", border: "none", background: "transparent", color: "var(--dash-danger)", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}>
                <LogOut size={15} /> Keluar
              </button>
            </div>
          )}

          {/* Notification popup */}
          {notificationOpen && (
            <div className="dash-popup-panel" style={{ position: "absolute", right: "68px", top: "66px", zIndex: 210, width: "320px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "16px", padding: "16px", boxShadow: "0 24px 48px -24px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--dash-text)" }}>Notifikasi</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "var(--dash-text-muted)" }}>Update terbaru panel admin.</p>
                </div>
                <button onClick={() => setNotificationOpen(false)} style={{ background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={15} /></button>
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {notifications.map((note, index) => (
                  <div key={index} style={{ padding: "11px", borderRadius: "11px", background: "var(--dash-surface-hover)", border: "1px solid var(--dash-border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "var(--dash-text)" }}>{note.title}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{note.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex: 1, overflowY: "auto", padding: "26px", minHeight: 0 }} className="dash-main">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 290, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
      )}

      {/* ══ RESPONSIVE STYLES ══ */}
      <style jsx global>{`
        .dash-sidebar { transition: transform 0.25s cubic-bezier(.4,0,.2,1); }
        .dash-nav-soft:hover { background: var(--dash-surface-hover); color: var(--dash-text) !important; }
        .dash-header-btn:hover { background: var(--dash-card-hover); }
        .dash-menu-item:hover { background: var(--dash-surface-hover); }

        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            z-index: 300; transform: translateX(-110%);
            width: 264px !important; padding: 22px 18px !important;
          }
          .dash-sidebar.open { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,0.25); }
          .dash-mob-toggle { display: flex !important; }
          .dash-main { padding: 14px !important; }
          .dash-hide-sm { display: none !important; }
          .dash-popup-panel { width: calc(100vw - 32px) !important; left: 16px !important; right: 16px !important; }
          /* Form grids stack on mobile */
          .dest-form-grid { grid-template-columns: 1fr !important; }
          .dest-form-aside { position: static !important; }
          .buat-grid { grid-template-columns: 1fr !important; }
          .buat-aside { position: static !important; }
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
        <ToastProvider>
          <DashboardShell>{children}</DashboardShell>
          <ToastStack />
        </ToastProvider>
      </ThemeProvider>
    </AdminProvider>
  );
}
