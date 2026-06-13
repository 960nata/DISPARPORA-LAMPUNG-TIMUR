"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Map,
  Grid,
  Settings,
  HelpCircle,
  Search,
  BookOpen,
  Users,
  Lock,
  UserCheck,
  FileText,
  User,
  Activity,
  Check
} from "lucide-react";
import DashboardChart from "@/components/DashboardChart";
import { StatCardSkeleton, ChartSkeleton, TableSkeleton, MapSkeleton } from "@/components/Skeleton";

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />
});

interface TourismItem {
  id: string;
  name: string;
  category: string;
  kecamatan: string;
  address: string;
  lat: number;
  lng: number;
  active: boolean;
  facilities?: string;
  contact?: string;
  map_link?: string;
  classification?: string;
  rooms?: number;
}

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: string; // "draft", "published"
  tags: string;
}

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string; // "superadmin", "admin_dinas", "admin_post"
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan"); // ringkasan, destinasi, berita, pengguna
  
  // Data lists
  const [destinations, setDestinations] = useState<TourismItem[]>([]);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Filters
  const [destSearch, setDestSearch] = useState("");
  const [destCategory, setDestCategory] = useState("Semua");
  const [newsSearch, setNewsSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Modals
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [destModalMode, setDestModalMode] = useState<"add" | "edit">("add");
  const [currentDest, setCurrentDest] = useState<Partial<TourismItem>>({
    name: "", category: "Wisata Alam", kecamatan: "Sukadana", address: "",
    facilities: "", contact: "", active: true, lat: -5.2514, lng: 105.5451
  });

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsModalMode, setNewsModalMode] = useState<"add" | "edit">("add");
  const [currentNews, setCurrentNews] = useState<Partial<NewsPost>>({
    title: "", content: "", imageUrl: "", status: "draft", tags: "Pariwisata"
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"add" | "edit">("add");
  const [currentUserForm, setCurrentUserForm] = useState({
    id: "", username: "", password: "", name: "", role: "admin_post"
  });

  // Attempt login validation
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      setCurrentUser(data);
      localStorage.setItem("admin_session", JSON.stringify(data));
      // Set initial tab based on role permissions
      if (data.role === "admin_post") {
        setActiveTab("berita");
      } else {
        setActiveTab("ringkasan");
      }
      loadDashboardData(data);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick login helper for development/testing
  const handleQuickLogin = async (role: string) => {
    let creds = { username: "superadmin", password: "password123" };
    if (role === "admin_dinas") creds = { username: "admindinas", password: "password123" };
    if (role === "admin_post") creds = { username: "adminpost", password: "password123" };

    setLoginUsername(creds.username);
    setLoginPassword(creds.password);
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      setCurrentUser(data);
      localStorage.setItem("admin_session", JSON.stringify(data));
      // Set initial tab based on role permissions
      if (data.role === "admin_post") {
        setActiveTab("berita");
      } else {
        setActiveTab("ringkasan");
      }
      loadDashboardData(data);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Load Admin session from localStorage
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session) {
      const parsedUser = JSON.parse(session);
      setCurrentUser(parsedUser);
      if (parsedUser.role === "admin_post") {
        setActiveTab("berita");
      }
      loadDashboardData(parsedUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadDashboardData = async (userProfile: AdminUser) => {
    setIsLoading(true);
    try {
      // Fetch destinations
      const destRes = await fetch("/api/destinations");
      const destData = await destRes.json();
      if (Array.isArray(destData)) setDestinations(destData);

      // Fetch posts
      const postRes = await fetch("/api/posts");
      const postData = await postRes.json();
      if (Array.isArray(postData)) setPosts(postData);

      // Fetch users (only superadmin can see/manage users)
      if (userProfile.role === "superadmin") {
        const userRes = await fetch("/api/users");
        const userData = await userRes.json();
        if (Array.isArray(userData)) setUsers(userData);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setCurrentUser(null);
    setLoginUsername("");
    setLoginPassword("");
  };

  // --- CRUD DESTINATIONS ---
  const handleOpenAddDest = () => {
    setDestModalMode("add");
    setCurrentDest({
      name: "", category: "Wisata Alam", kecamatan: "Sukadana", address: "",
      facilities: "", contact: "", active: true, lat: -5.2514, lng: 105.5451
    });
    setIsDestModalOpen(true);
  };

  const handleOpenEditDest = (item: TourismItem) => {
    setDestModalMode("edit");
    setCurrentDest({ ...item });
    setIsDestModalOpen(true);
  };

  const handleDestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDest.name || !currentDest.lat || !currentDest.lng) {
      alert("Nama dan Koordinat harus diisi!");
      return;
    }

    try {
      const isAdd = destModalMode === "add";
      const url = isAdd ? "/api/destinations" : `/api/destinations/${currentDest.id}`;
      const method = isAdd ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentDest)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      if (isAdd) {
        setDestinations(prev => [data, ...prev]);
      } else {
        setDestinations(prev => prev.map(item => item.id === data.id ? data : item));
      }
      setIsDestModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDest = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) return;
    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDestinations(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- CRUD CMS NEWS (POSTS) ---
  const handleOpenAddNews = () => {
    setNewsModalMode("add");
    setCurrentNews({
      title: "", content: "", imageUrl: "", status: "draft", tags: "Pariwisata"
    });
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (post: NewsPost) => {
    setNewsModalMode("edit");
    setCurrentNews({ ...post });
    setIsNewsModalOpen(true);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNews.title || !currentNews.content) {
      alert("Judul dan isi berita wajib diisi!");
      return;
    }

    try {
      const isAdd = newsModalMode === "add";
      const url = isAdd ? "/api/posts" : `/api/posts/${currentNews.id}`;
      const method = isAdd ? "POST" : "PUT";

      const bodyData = {
        ...currentNews,
        authorId: currentUser?.id
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan berita");

      if (isAdd) {
        setPosts(prev => [data, ...prev]);
      } else {
        setPosts(prev => prev.map(p => p.id === data.id ? data : p));
      }
      setIsNewsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- CRUD USERS ---
  const handleOpenAddUser = () => {
    setUserModalMode("add");
    setCurrentUserForm({
      id: "", username: "", password: "", name: "", role: "admin_post"
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AdminUser) => {
    setUserModalMode("edit");
    setCurrentUserForm({
      id: u.id, username: u.username, password: "", name: u.name, role: u.role
    });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserForm.username || !currentUserForm.name || (userModalMode === "add" && !currentUserForm.password)) {
      alert("Semua field bertanda bintang wajib diisi!");
      return;
    }

    try {
      const isAdd = userModalMode === "add";
      const url = isAdd ? "/api/users" : `/api/users/${currentUserForm.id}`;
      const method = isAdd ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUserForm)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan user");

      if (isAdd) {
        setUsers(prev => [...prev, data]);
      } else {
        setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      }
      setIsUserModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus akun admin ini?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- STATISTICS CALCULATIONS ---
  const totalAlam = destinations.filter(i => i.category === "Wisata Alam").length;
  const totalBuatan = destinations.filter(i => i.category === "Wisata Buatan").length;
  const totalBudaya = destinations.filter(i => i.category === "Wisata Budaya").length;
  const totalAkomodasi = destinations.filter(i => i.category === "Akomodasi").length;
  const totalNews = posts.length;

  const activeCount = destinations.filter(i => i.active).length;
  const inactiveCount = destinations.filter(i => !i.active).length;
  const activePercentage = Math.round((activeCount / destinations.length) * 100) || 0;

  // X-Axis Kecamatan stats
  const kecamatans = ["Sukadana", "Labuhan Maringgai", "Labuhan Ratu", "Bandar Sribhawono", "Sekampung Udik", "Pekalongan", "Pasir Sakti", "Way Jepara", "Mataram Baru"];
  const wisataCountsByKec = kecamatans.map(k => 
    destinations.filter(i => i.kecamatan.toLowerCase() === k.toLowerCase() && i.category.startsWith("Wisata")).length
  );
  const akomodasiCountsByKec = kecamatans.map(k => 
    destinations.filter(i => i.kecamatan.toLowerCase() === k.toLowerCase() && i.category === "Akomodasi").length
  );

  const barChartOptions = {
    chart: { foreColor: "#9ca3af", toolbar: { show: false } },
    colors: ["#6366f1", "#10b981"],
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: kecamatans },
    yaxis: { title: { text: "Jumlah Objek" } },
    fill: { opacity: 1 },
    tooltip: { theme: "dark", y: { formatter: (val: number) => `${val} Objek` } },
    legend: { labels: { colors: "#9ca3af" } }
  };

  const barChartSeries = [
    { name: "Destinasi Wisata", data: wisataCountsByKec },
    { name: "Akomodasi Hotel", data: akomodasiCountsByKec }
  ];

  const donutChartOptions = {
    labels: ["Wisata Alam", "Wisata Buatan", "Wisata Budaya", "Akomodasi"],
    colors: ["#059669", "#d97706", "#8b5cf6", "#3b82f6"],
    chart: { foreColor: "#9ca3af" },
    legend: { position: "bottom", labels: { colors: "#9ca3af" } },
    tooltip: { theme: "dark" },
    stroke: { show: false }
  };

  const donutChartSeries = [totalAlam, totalBuatan, totalBudaya, totalAkomodasi];

  const radialChartOptions = {
    chart: { foreColor: "#9ca3af" },
    colors: ["#10b981"],
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: {
          show: true,
          name: { show: true, fontSize: "14px", color: "#9ca3af" },
          value: { fontSize: "24px", color: "#f9fafb", formatter: (val: number) => `${val}%` }
        }
      }
    },
    labels: ["Objek Aktif"]
  };

  const radialChartSeries = [activePercentage];

  // --- FILTERING LISTS ---
  const filteredDestinations = destinations.filter(item => {
    const matchesCategory = destCategory === "Semua" || item.category === destCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(destSearch.toLowerCase()) ||
      item.kecamatan.toLowerCase().includes(destSearch.toLowerCase()) ||
      item.address.toLowerCase().includes(destSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
    post.tags.toLowerCase().includes(newsSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  // --- LOGIN SCREEN RENDER ---
  if (!currentUser) {
    return (
      <div style={{
        backgroundColor: "#030712",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f3f4f6",
        padding: "1.5rem",
        background: "radial-gradient(circle at center, #111827 0%, #030712 100%)"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dash-card"
          style={{ width: "100%", maxWidth: "440px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <img src="/logo.avif" alt="Logo" style={{ width: "64px", height: "64px", objectFit: "contain", marginBottom: "0.25rem" }} />
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>Sistem Manajemen Terpadu</h2>
              <p style={{ color: "var(--dash-text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                SIMAD - Disparpora Kabupaten Lampung Timur
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="dash-input"
                placeholder="Masukkan username..."
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="dash-input"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--dash-danger)", fontSize: "0.8rem", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "0.75rem", borderRadius: "8px" }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" className="dash-btn" style={{ width: "100%", padding: "0.85rem", display: "flex", gap: "0.5rem", justifyContent: "center" }} disabled={loginLoading}>
              {loginLoading ? <RefreshCw size={18} className="animate-spin" /> : <Lock size={18} />}
              Masuk ke Dashboard
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--dash-border)", paddingTop: "1.25rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)", textAlign: "center" }}>QUICK TESTING BYPASS LOGIN</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button onClick={() => handleQuickLogin("superadmin")} className="dash-btn" style={{ flex: 1, padding: "0.4rem 0.5rem", fontSize: "0.75rem", backgroundColor: "transparent", border: "1px solid #4f46e5", color: "#6366f1" }}>Superadmin</button>
              <button onClick={() => handleQuickLogin("admin_dinas")} className="dash-btn" style={{ flex: 1, padding: "0.4rem 0.5rem", fontSize: "0.75rem", backgroundColor: "transparent", border: "1px solid #059669", color: "#10b981" }}>Admin Dinas</button>
              <button onClick={() => handleQuickLogin("admin_post")} className="dash-btn" style={{ flex: 1, padding: "0.4rem 0.5rem", fontSize: "0.75rem", backgroundColor: "transparent", border: "1px solid #db2777", color: "#ec4899" }}>Admin Post</button>
            </div>
          </div>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--dash-text-muted)", justifyContent: "center", marginTop: "0.5rem" }}>
            <ArrowLeft size={14} /> Kembali ke Portal Publik
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <img src="/logo.avif" alt="Logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
          <div>
            <h3 style={{ fontSize: "1rem", color: "white", fontWeight: 800 }}>DISPARPORA</h3>
            <span style={{ fontSize: "0.7rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>PORTAL ADMIN</span>
          </div>
        </div>

        {/* Sidebar Nav (Filtered by role) */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1 }}>
          {currentUser.role !== "admin_post" && (
            <>
              <button
                onClick={() => setActiveTab("ringkasan")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px",
                  backgroundColor: activeTab === "ringkasan" ? "rgba(255,255,255,0.05)" : "transparent",
                  color: activeTab === "ringkasan" ? "white" : "var(--dash-text-muted)", fontSize: "0.9rem", fontWeight: 600,
                  border: "none", width: "100%", textAlign: "left", cursor: "pointer"
                }}
              >
                <Grid size={18} />
                Ringkasan Stats
              </button>
              <button
                onClick={() => setActiveTab("destinasi")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px",
                  backgroundColor: activeTab === "destinasi" ? "rgba(255,255,255,0.05)" : "transparent",
                  color: activeTab === "destinasi" ? "white" : "var(--dash-text-muted)", fontSize: "0.9rem", fontWeight: 600,
                  border: "none", width: "100%", textAlign: "left", cursor: "pointer"
                }}
              >
                <MapPin size={18} />
                Destinasi Wisata
              </button>
            </>
          )}

          {(currentUser.role === "superadmin" || currentUser.role === "admin_post") && (
            <button
              onClick={() => setActiveTab("berita")}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px",
                backgroundColor: activeTab === "berita" ? "rgba(255,255,255,0.05)" : "transparent",
                color: activeTab === "berita" ? "white" : "var(--dash-text-muted)", fontSize: "0.9rem", fontWeight: 600,
                border: "none", width: "100%", textAlign: "left", cursor: "pointer"
              }}
            >
              <FileText size={18} />
              Berita (CMS)
            </button>
          )}

          {currentUser.role === "superadmin" && (
            <button
              onClick={() => setActiveTab("pengguna")}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px",
                backgroundColor: activeTab === "pengguna" ? "rgba(255,255,255,0.05)" : "transparent",
                color: activeTab === "pengguna" ? "white" : "var(--dash-text-muted)", fontSize: "0.9rem", fontWeight: 600,
                border: "none", width: "100%", textAlign: "left", cursor: "pointer"
              }}
            >
              <Users size={18} />
              Kelola Admin
            </button>
          )}

          <div style={{ height: "1px", backgroundColor: "var(--dash-border)", margin: "1rem 0" }} />
          
          <Link href="/peta" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", color: "var(--dash-text-muted)", fontSize: "0.9rem" }}>
            <Map size={18} />
            Lihat Peta Publik
          </Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", color: "var(--dash-text-muted)", fontSize: "0.9rem" }}>
            <ArrowLeft size={18} />
            Halaman Utama
          </Link>
        </nav>

        {/* User profile footer */}
        <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--dash-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>{currentUser.name}</p>
              <p style={{ fontSize: "0.65rem", color: "var(--dash-text-muted)", textTransform: "uppercase" }}>Role: {currentUser.role.replace("_", " ")}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ color: "var(--dash-danger)", background: "none", border: "none", cursor: "pointer" }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content">
        {/* Header Toolbar */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", textTransform: "capitalize" }}>
              Panel {activeTab.replace("ringkasan", "Ringkasan Stats").replace("destinasi", "Destinasi Wisata").replace("berita", "News CMS").replace("pengguna", "Kelola Admin")}
            </h1>
            <p style={{ color: "var(--dash-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Masuk sebagai <strong style={{ color: "white" }}>{currentUser.name}</strong> • SIMAD Lampung Timur.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => loadDashboardData(currentUser)}
              className="dash-btn"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Muat Ulang
            </button>
            {activeTab === "destinasi" && (
              <button onClick={handleOpenAddDest} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={18} /> Tambah Destinasi
              </button>
            )}
            {activeTab === "berita" && (
              <button onClick={handleOpenAddNews} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={18} /> Buat Berita
              </button>
            )}
            {activeTab === "pengguna" && (
              <button onClick={handleOpenAddUser} className="dash-btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={18} /> Tambah Admin
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          // SKELETON DISPLAY WHILE LOADING DATA
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {activeTab === "ringkasan" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1.5rem" }} className="grid-charts-loader">
                  <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
                </div>
              </>
            )}
            {activeTab !== "ringkasan" && <TableSkeleton />}
          </div>
        ) : (
          // RENDER TAB VIEW CONTENT
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* VIEW TAB: RINGKASAN STATISTICS */}
            {activeTab === "ringkasan" && (
              <>
                {/* Stats Cards Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                  {[
                    { title: "Total Destinasi & Hotel", value: destinations.length, label: `Aktif: ${activeCount} / Non-Aktif: ${inactiveCount}`, color: "var(--dash-primary)" },
                    { title: "Total Penginapan", value: totalAkomodasi, label: "Hotel & Homestay Terdaftar", color: "#3b82f6" },
                    { title: "Berita Diterbitkan", value: totalNews, label: "Jumlah Konten CMS Berita", color: "#8b5cf6" },
                    { title: "Persentase Objek Aktif", value: `${activePercentage}%`, label: "Rasio Keaktifan Destinasi Daerah", color: "var(--dash-success)" }
                  ].map((stat, idx) => (
                    <div key={idx} className="dash-card" style={{ borderLeft: `4px solid ${stat.color}`, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--dash-text-muted)", fontWeight: 600 }}>{stat.title}</span>
                      <h3 style={{ fontSize: "2rem", color: "white", fontWeight: 800 }}>{stat.value}</h3>
                      <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)" }}>{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1.5rem" }} className="grid-charts">
                  <div className="dash-card">
                    <h4 style={{ fontSize: "1rem", color: "white", fontWeight: 700, marginBottom: "1rem" }}>Sebaran Objek Per Kecamatan</h4>
                    <DashboardChart options={barChartOptions} series={barChartSeries} type="bar" height={260} />
                  </div>
                  <div className="dash-card">
                    <h4 style={{ fontSize: "1rem", color: "white", fontWeight: 700, marginBottom: "1rem" }}>Proporsi Objek Wisata</h4>
                    <DashboardChart options={donutChartOptions} series={donutChartSeries} type="donut" height={260} />
                  </div>
                  <div className="dash-card" style={{ display: "flex", flexDirection: "column" }}>
                    <h4 style={{ fontSize: "1rem", color: "white", fontWeight: 700, marginBottom: "1rem" }}>Status Operasional</h4>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DashboardChart options={radialChartOptions} series={radialChartSeries} type="radialBar" height={260} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VIEW TAB: DESTINASIS MANAGEMENT */}
            {activeTab === "destinasi" && (
              <section className="dash-card" style={{ padding: "1.5rem 0" }}>
                {/* Table Toolbar */}
                <div style={{ padding: "0 1.5rem 1.25rem 1.5rem", borderBottom: "1px solid var(--dash-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", color: "white", fontWeight: 700 }}>Kelola Destinasi Wisata & Hotel</h4>
                    <p style={{ color: "var(--dash-text-muted)", fontSize: "0.75rem" }}>Total {filteredDestinations.length} Objek Ditemukan</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "#1f2937", fontSize: "0.85rem" }}>
                      <Search size={16} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
                      <input type="text" placeholder="Cari destinasi..." value={destSearch} onChange={(e) => setDestSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: "white", width: "160px" }} />
                    </div>
                    <select value={destCategory} onChange={(e) => setDestCategory(e.target.value)} style={{ padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid var(--dash-border)", backgroundColor: "#1f2937", color: "white", fontSize: "0.85rem", outline: "none" }}>
                      <option value="Semua">Semua Kategori</option>
                      <option value="Wisata Alam">Wisata Alam</option>
                      <option value="Wisata Buatan">Wisata Buatan</option>
                      <option value="Wisata Budaya">Wisata Budaya</option>
                      <option value="Akomodasi">Akomodasi</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Nama Objek</th>
                        <th>Kategori</th>
                        <th>Kecamatan</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDestinations.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Tidak ada objek ditemukan.</td></tr>
                      ) : (
                        filteredDestinations.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 700, color: "white" }}>{item.name}</td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor: item.category === "Akomodasi" ? "#1e3a8a" : "rgba(255,255,255,0.05)",
                                color: item.category === "Akomodasi" ? "#3b82f6" : "white",
                                fontSize: "0.7rem", padding: "0.15rem 0.5rem"
                              }}>{item.category}</span>
                            </td>
                            <td>{item.kecamatan}</td>
                            <td>
                              <span className={`badge ${item.active ? "badge-success" : "badge-danger"}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                                {item.active ? "Aktif" : "Non-Aktif"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenEditDest(item)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.25rem" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteDest(item.id)} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.25rem" }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* VIEW TAB: NEWS CMS MANAGEMENT */}
            {activeTab === "berita" && (
              <section className="dash-card" style={{ padding: "1.5rem 0" }}>
                <div style={{ padding: "0 1.5rem 1.25rem 1.5rem", borderBottom: "1px solid var(--dash-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", color: "white", fontWeight: 700 }}>Manajemen Berita (CMS)</h4>
                    <p style={{ color: "var(--dash-text-muted)", fontSize: "0.75rem" }}>Publikasikan agenda pariwisata daerah</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "#1f2937", fontSize: "0.85rem" }}>
                    <Search size={16} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
                    <input type="text" placeholder="Cari berita..." value={newsSearch} onChange={(e) => setNewsSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: "white", width: "160px" }} />
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Judul Berita</th>
                        <th>Penulis</th>
                        <th>Tanggal Rilis</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Tidak ada postingan berita.</td></tr>
                      ) : (
                        filteredPosts.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 700, color: "white", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                            <td>{p.authorName}</td>
                            <td>{new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                            <td>
                              <span className={`badge ${p.status === "published" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                                {p.status === "published" ? "Diterbitkan" : "Draft"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenEditNews(p)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.25rem" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteNews(p.id)} style={{ background: "none", border: "none", color: "var(--dash-danger)", cursor: "pointer", padding: "0.25rem" }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* VIEW TAB: USER MANAGEMENT (SUPERADMIN ONLY) */}
            {activeTab === "pengguna" && currentUser.role === "superadmin" && (
              <section className="dash-card" style={{ padding: "1.5rem 0" }}>
                <div style={{ padding: "0 1.5rem 1.25rem 1.5rem", borderBottom: "1px solid var(--dash-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", color: "white", fontWeight: 700 }}>Manajemen Akun & Peran Staf</h4>
                    <p style={{ color: "var(--dash-text-muted)", fontSize: "0.75rem" }}>Kelola kredensial login admin SIMAD</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dash-border)", borderRadius: "8px", padding: "0.4rem 0.75rem", backgroundColor: "#1f2937", fontSize: "0.85rem" }}>
                    <Search size={16} style={{ color: "var(--dash-text-muted)", marginRight: "0.5rem" }} />
                    <input type="text" placeholder="Cari nama admin..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", color: "white", width: "160px" }} />
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Nama Staf</th>
                        <th>Username</th>
                        <th>Peran (Akses)</th>
                        <th style={{ textAlign: "right" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "var(--dash-text-muted)" }}>Tidak ada akun administrator terdaftar.</td></tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700, color: "white" }}>{u.name}</td>
                            <td>{u.username}</td>
                            <td>
                              <span className="badge" style={{
                                backgroundColor:
                                  u.role === "superadmin" ? "rgba(239, 68, 68, 0.15)" :
                                  u.role === "admin_dinas" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color:
                                  u.role === "superadmin" ? "#f87171" :
                                  u.role === "admin_dinas" ? "#34d399" : "#fbbf24",
                                fontSize: "0.75rem", padding: "0.2rem 0.6rem", textTransform: "capitalize"
                              }}>
                                {u.role.replace("_", " ")}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                <button onClick={() => handleOpenEditUser(u)} style={{ background: "none", border: "none", color: "var(--dash-primary)", cursor: "pointer", padding: "0.25rem" }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === "usr_superadmin"} style={{ background: "none", border: "none", color: u.id === "usr_superadmin" ? "#374151" : "var(--dash-danger)", cursor: u.id === "usr_superadmin" ? "not-allowed" : "pointer", padding: "0.25rem" }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* --- FORM MODAL: DESTINASI WISATA --- */}
      {isDestModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyItems: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card animate-fadeIn" style={{ width: "100%", maxWidth: "850px", maxHeight: "90vh", overflowY: "auto", position: "relative", backgroundColor: "#111827" }}>
            <button onClick={() => setIsDestModalOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={20} /></button>
            <h3 style={{ fontSize: "1.25rem", color: "white", fontWeight: 800, marginBottom: "1.5rem" }}>{destModalMode === "add" ? "Tambah Objek Wisata Baru" : "Edit Detail Destinasi"}</h3>
            <form onSubmit={handleDestSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Nama Objek *</label>
                  <input type="text" required value={currentDest.name || ""} onChange={(e) => setCurrentDest(prev => ({ ...prev, name: e.target.value }))} className="dash-input" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Kategori *</label>
                    <select value={currentDest.category} onChange={(e) => setCurrentDest(prev => ({ ...prev, category: e.target.value }))} className="dash-input">
                      <option value="Wisata Alam">Wisata Alam</option>
                      <option value="Wisata Buatan">Wisata Buatan</option>
                      <option value="Wisata Budaya">Wisata Budaya</option>
                      <option value="Akomodasi">Akomodasi</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Kecamatan *</label>
                    <select value={currentDest.kecamatan} onChange={(e) => setCurrentDest(prev => ({ ...prev, kecamatan: e.target.value }))} className="dash-input">
                      {kecamatans.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Alamat Lengkap</label>
                  <input type="text" value={currentDest.address || ""} onChange={(e) => setCurrentDest(prev => ({ ...prev, address: e.target.value }))} className="dash-input" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Latitude *</label>
                    <input type="number" step="any" required value={currentDest.lat || ""} onChange={(e) => setCurrentDest(prev => ({ ...prev, lat: Number(e.target.value) }))} className="dash-input" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Longitude *</label>
                    <input type="number" step="any" required value={currentDest.lng || ""} onChange={(e) => setCurrentDest(prev => ({ ...prev, lng: Number(e.target.value) }))} className="dash-input" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Fasilitas Pendukung (pisahkan dengan koma)</label>
                    <input type="text" value={currentDest.facilities || ""} onChange={(e) => setCurrentDest(prev => ({ ...prev, facilities: e.target.value }))} className="dash-input" placeholder="Gazebo, Mushola, Toilet" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "45px", marginTop: "1rem" }}>
                    <input type="checkbox" id="destActive" checked={currentDest.active !== false} onChange={(e) => setCurrentDest(prev => ({ ...prev, active: e.target.checked }))} style={{ width: "18px", height: "18px", accentColor: "var(--dash-primary)" }} />
                    <label htmlFor="destActive" style={{ fontSize: "0.85rem", color: "white" }}>Aktif</label>
                  </div>
                </div>
              </div>

              {/* Map Coordinates Picker Column */}
              <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Plot Lokasi di Peta Lampung Timur</label>
                <div style={{ height: "260px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--dash-border)" }}>
                  <MapComponent
                    items={[]}
                    selectedItem={{
                      id: "picker",
                      name: currentDest.name || "Lokasi Baru",
                      kecamatan: currentDest.kecamatan || "Sukadana",
                      address: currentDest.address || "",
                      category: currentDest.category || "Wisata Alam",
                      lat: currentDest.lat || -5.2514,
                      lng: currentDest.lng || 105.5451
                    }}
                    onSelectItem={() => {}}
                    isEditMode={true}
                    onCoordinatesChange={(lat, lng) => {
                      setCurrentDest(prev => ({ ...prev, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }));
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
                  <button type="button" onClick={() => setIsDestModalOpen(false)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                  <button type="submit" className="dash-btn" style={{ flex: 1 }}>Simpan</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORM MODAL: NEWS POST (CMS) --- */}
      {isNewsModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyItems: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", position: "relative", backgroundColor: "#111827", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button onClick={() => setIsNewsModalOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={20} /></button>
            <h3 style={{ fontSize: "1.25rem", color: "white", fontWeight: 800 }}>{newsModalMode === "add" ? "Tulis Berita Baru" : "Edit Berita"}</h3>
            <form onSubmit={handleNewsSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Judul Artikel *</label>
                <input type="text" required value={currentNews.title || ""} onChange={(e) => setCurrentNews(prev => ({ ...prev, title: e.target.value }))} className="dash-input" placeholder="Masukkan judul menarik..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Status Rilis</label>
                  <select value={currentNews.status} onChange={(e) => setCurrentNews(prev => ({ ...prev, status: e.target.value }))} className="dash-input">
                    <option value="draft">Draft (Simpan Internal)</option>
                    <option value="published">Diterbitkan (Terlihat di Publik)</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Tag / Topik (pisahkan dengan koma)</label>
                  <input type="text" value={currentNews.tags || ""} onChange={(e) => setCurrentNews(prev => ({ ...prev, tags: e.target.value }))} className="dash-input" placeholder="Event, Festival, Pengumuman" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>URL Gambar Thumbnail</label>
                <input type="text" value={currentNews.imageUrl || ""} onChange={(e) => setCurrentNews(prev => ({ ...prev, imageUrl: e.target.value }))} className="dash-input" placeholder="https://images.unsplash.com/..." />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Konten Berita Lengkap *</label>
                <textarea rows={8} required value={currentNews.content || ""} onChange={(e) => setCurrentNews(prev => ({ ...prev, content: e.target.value }))} className="dash-input" placeholder="Tuliskan berita lengkap di sini..." style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsNewsModalOpen(false)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                <button type="submit" className="dash-btn" style={{ flex: 1 }}>Simpan Postingan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORM MODAL: MANAJEMEN USER --- */}
      {isUserModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyItems: "center", zIndex: 9999, padding: "1rem" }}>
          <div className="dash-card" style={{ width: "100%", maxWidth: "450px", position: "relative", backgroundColor: "#111827", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button onClick={() => setIsUserModalOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--dash-text-muted)", cursor: "pointer" }}><X size={20} /></button>
            <h3 style={{ fontSize: "1.25rem", color: "white", fontWeight: 800 }}>{userModalMode === "add" ? "Daftarkan Akun Admin Baru" : "Edit Profil Administrator"}</h3>
            <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Nama Staf *</label>
                <input type="text" required value={currentUserForm.name} onChange={(e) => setCurrentUserForm(prev => ({ ...prev, name: e.target.value }))} className="dash-input" placeholder="Nama lengkap..." />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Username Login *</label>
                <input type="text" required disabled={userModalMode === "edit"} value={currentUserForm.username} onChange={(e) => setCurrentUserForm(prev => ({ ...prev, username: e.target.value }))} className="dash-input" placeholder="username_staf" style={{ cursor: userModalMode === "edit" ? "not-allowed" : "text" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>
                  Password {userModalMode === "edit" ? "(Kosongkan jika tidak diganti)" : "*"}
                </label>
                <input type="password" required={userModalMode === "add"} value={currentUserForm.password} onChange={(e) => setCurrentUserForm(prev => ({ ...prev, password: e.target.value }))} className="dash-input" placeholder="••••••••" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--dash-text-muted)" }}>Peran Akses (Role) *</label>
                <select value={currentUserForm.role} onChange={(e) => setCurrentUserForm(prev => ({ ...prev, role: e.target.value }))} className="dash-input">
                  <option value="superadmin">Superadmin (Akses Penuh)</option>
                  <option value="admin_dinas">Admin Dinas (Eksklusif Destinasi & Hotel)</option>
                  <option value="admin_post">Admin Post (Eksklusif CMS Berita)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="dash-btn" style={{ flex: 1, backgroundColor: "transparent", border: "1px solid var(--dash-border)" }}>Batal</button>
                <button type="submit" className="dash-btn" style={{ flex: 1 }}>Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS Overrides for Dashboard Layout */}
      <style jsx global>{`
        body {
          background-color: var(--dash-bg) !important;
        }
        @media (max-width: 900px) {
          .dashboard-wrapper {
            flex-direction: column !important;
          }
          .dashboard-sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--dash-border);
          }
          .grid-charts {
            grid-template-columns: 1fr !important;
          }
          .grid-charts-loader {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
