@AGENTS.md

# SIMAD — Sistem Informasi Manajemen Disparpora Lampung Timur

## ⚠️ LARANGAN KERAS
- **JANGAN SENTUH** `src/app/page.tsx` dan semua file di `src/components/home/` — home page sudah final
- **JANGAN SENTUH** `src/app/profil/` — hero section profil sudah final
- Jangan hapus CSS variables di `:root` di `globals.css` — hanya boleh tambah

---

## Stack
- **Framework**: Next.js 16 App Router (`"use client"` untuk semua interaktif)
- **Styling**: Pure CSS dengan design tokens (TIDAK ada Tailwind)
- **Rich Text**: TipTap (`@tiptap/react` + starter-kit + underline + link + text-align + placeholder)
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- **Charts**: ApexCharts via `DashboardChart` component (`dynamic` import, SSR false)
- **Map**: MapLibre GL (`MapComponent.tsx`)

## Struktur Folder
```
src/
├── app/
│   ├── page.tsx                  ← HOME — JANGAN DISENTUH
│   ├── layout.tsx                ← Root layout (pakai ConditionalLayout)
│   ├── globals.css               ← Semua CSS + design tokens
│   ├── berita/                   ← Public news pages
│   ├── profil/                   ← JANGAN DISENTUH
│   ├── direktori/                ← Direktori wisata publik
│   ├── kontak/                   ← Form kontak (validasi sudah jalan)
│   ├── peta/                     ← Peta wisata interaktif
│   ├── bidang/                   ← Halaman bidang dinas
│   ├── dashboard/                ← Admin dashboard (auth required)
│   │   ├── layout.tsx            ← Shell: LoginScreen + header + sidebar
│   │   ├── page.tsx              ← Overview + charts
│   │   ├── berita/page.tsx       ← CMS berita (list + CRUD)
│   │   ├── berita/buat/page.tsx  ← Block editor (WordPress-like)
│   │   ├── destinasi/page.tsx    ← Manajemen destinasi
│   │   └── pengguna/page.tsx     ← Manajemen user (superadmin only)
│   └── api/
│       ├── posts/                ← CRUD berita
│       ├── destinations/         ← CRUD destinasi
│       ├── users/                ← User management
│       ├── login/                ← Auth endpoint
│       └── partners/             ← Data partner
├── components/
│   ├── home/                     ← JANGAN DISENTUH
│   ├── admin/
│   │   ├── BlockEditor.tsx       ← Block-based drag & drop editor
│   │   └── MediaLibrary.tsx      ← Image library (localStorage base64)
│   ├── ConditionalLayout.tsx     ← Hide Header/Footer di /dashboard
│   ├── DashboardChart.tsx        ← ApexCharts wrapper (SSR: false)
│   ├── Header.tsx / Footer.tsx
│   ├── FloatingButtons.tsx
│   ├── MapComponent.tsx
│   └── Skeleton.tsx
└── contexts/
    └── AdminContext.tsx           ← Auth state (localStorage: admin_session)
```

## CSS Design Tokens (globals.css)
```css
/* Dashboard tokens — gunakan ini, jangan hardcode warna */
--dash-bg, --dash-sidebar, --dash-card, --dash-card-2, --dash-card-hover
--dash-border, --dash-border-2
--dash-text, --dash-text-muted, --dash-text-soft
--dash-primary, --dash-primary-hover, --dash-primary-glow
--dash-success, --dash-success-glow
--dash-warning, --dash-danger, --dash-danger-glow

/* Public site tokens */
--bg-primary, --bg-secondary, --text-primary, --text-secondary
--accent, --accent-hover, --font-main
```

## Dashboard CSS Classes
```
.dash-card            → kartu standar
.dash-card-hover      → kartu dengan hover lift + glow
.dash-stat-card       → stat card dengan top accent line (set --dash-stat-accent)
.dash-input           → input dengan focus ring ungu
.dash-btn             → gradient button (override bg untuk variant lain)
.dash-table           → tabel styled
.dash-nav-item        → nav link sidebar
.dash-nav-item.active → active state (left border + gradient bg)
.dash-nav-label       → section label di sidebar
.dash-badge           → badge inline
.dash-badge-success/warning/danger/primary
.dash-scroll          → custom scrollbar
```

## Konvensi Penting
- Semua halaman dashboard: `"use client"` + `useAdmin()` dari `AdminContext`
- Block content di posts disimpan sebagai `JSON.stringify(blocks)` di field `content`
- MediaLibrary pakai localStorage key: `simad_media_library` (base64 images)
- TipTap & BlockEditor wajib di-`dynamic(() => import(...), { ssr: false })`
- Dashboard di `/dashboard/*` → `ConditionalLayout` otomatis hide site Header/Footer
- Role: `superadmin` | `admin_dinas` | `admin_post`

## API Routes
| Route | Method | Deskripsi |
|---|---|---|
| `/api/posts` | GET, POST | List & buat berita |
| `/api/posts/[id]` | GET, PUT, DELETE | Detail, edit, hapus berita |
| `/api/destinations` | GET, POST | List & tambah destinasi |
| `/api/destinations/[id]` | PUT, DELETE | Edit & hapus destinasi |
| `/api/users` | GET, POST | List & tambah user (superadmin) |
| `/api/users/[id]` | PUT, DELETE | Edit & hapus user |
| `/api/login` | POST | Auth, return user object |
| `/api/partners` | GET | Data mitra/partner |
