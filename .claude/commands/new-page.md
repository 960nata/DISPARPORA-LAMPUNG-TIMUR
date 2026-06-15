# Buat Halaman Dashboard Baru

Buat halaman admin dashboard baru di `src/app/dashboard/$ARGUMENTS/page.tsx`.

Ikuti template ini:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
// import icon dari lucide-react

export default function [Nama]Page() {
  const { user } = useAdmin();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/[endpoint]")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "white" }}>Judul</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--dash-text-muted)", marginTop: "0.2rem" }}>Deskripsi</p>
        </div>
      </div>
      {/* Content */}
    </div>
  );
}
```

Wajib:
- Gunakan `.dash-card`, `.dash-input`, `.dash-btn`, `.dash-table`, `.dash-badge` — jangan CSS inline dari nol
- Tambahkan nav item di `dashboard/layout.tsx` NAV config
- Tambahkan CRUMBS entry di layout untuk breadcrumb
- Sesuaikan role restriction jika perlu
