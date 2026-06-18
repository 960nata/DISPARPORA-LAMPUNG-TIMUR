"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    try {
      const session = localStorage.getItem("admin_session");
      if (session) setUser(JSON.parse(session));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_session");
    setUser(null);
  };

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
