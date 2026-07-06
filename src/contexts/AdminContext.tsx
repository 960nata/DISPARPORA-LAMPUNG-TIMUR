"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
}

interface AdminContextType {
  user: AdminUser | null;
  setUser: (u: AdminUser | null) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Auto logout setelah 10 menit tanpa aktivitas
const IDLE_LIMIT_MS = 10 * 60 * 1000;
const ACTIVITY_KEY = "admin_last_activity";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AdminUser | null>(null);

  const setUser = (u: AdminUser | null) => {
    if (u) {
      try { sessionStorage.setItem(ACTIVITY_KEY, String(Date.now())); } catch {}
    }
    setUserState(u);
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_session");
    sessionStorage.removeItem(ACTIVITY_KEY);
    // Bersihkan sisa session lama dari localStorage (versi sebelumnya)
    localStorage.removeItem("admin_session");
    localStorage.removeItem(ACTIVITY_KEY);
    fetch("/api/logout", { method: "POST" }).catch(() => {});
    setUserState(null);
  }, []);

  useEffect(() => {
    try {
      // Migrasi: session lama di localStorage tidak dipakai lagi — tab baru wajib login
      localStorage.removeItem("admin_session");
      localStorage.removeItem(ACTIVITY_KEY);

      const session = sessionStorage.getItem("admin_session");
      if (!session) return;
      const last = Number(sessionStorage.getItem(ACTIVITY_KEY) || 0);
      if (last && Date.now() - last > IDLE_LIMIT_MS) {
        // Sesi ditinggal terlalu lama → paksa logout
        sessionStorage.removeItem("admin_session");
        sessionStorage.removeItem(ACTIVITY_KEY);
        fetch("/api/logout", { method: "POST" }).catch(() => {});
        return;
      }
      setUserState(JSON.parse(session));
      sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    } catch {}
  }, []);

  // Pantau aktivitas selama login; idle 10 menit → logout otomatis
  useEffect(() => {
    if (!user) return;

    let lastWrite = Date.now();
    const stamp = () => {
      const now = Date.now();
      if (now - lastWrite < 30_000) return; // throttle penulisan storage
      lastWrite = now;
      try { sessionStorage.setItem(ACTIVITY_KEY, String(now)); } catch {}
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, stamp, { passive: true }));

    const timer = setInterval(() => {
      const last = Number(sessionStorage.getItem(ACTIVITY_KEY) || lastWrite);
      if (Date.now() - last > IDLE_LIMIT_MS) logout();
    }, 60_000);

    return () => {
      events.forEach(e => window.removeEventListener(e, stamp));
      clearInterval(timer);
    };
  }, [user, logout]);

  return (
    <AdminContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be within AdminProvider");
  return ctx;
}
