# Cek Penggunaan CSS Token

Scan seluruh file di `src/` dan cari:

1. **Warna hardcode yang seharusnya pakai token**:
   - `#0b1120`, `#060b16`, `#04070f`, `#111827`, `#1f2937` → harusnya `var(--dash-card)`, `var(--dash-sidebar)`, dll
   - `#6366f1`, `#4f46e5` → harusnya `var(--dash-primary)`
   - `#22c55e` → harusnya `var(--dash-success)`
   - `#ef4444` → harusnya `var(--dash-danger)`
   - `#f59e0b` → harusnya `var(--dash-warning)`

2. **Class lama yang sudah diganti**:
   - `className="badge"` → harusnya `className="dash-badge"`
   - `className="badge-success"` → `className="dash-badge-success"`

3. **File yang tidak boleh diubah tapi ada perubahan**:
   - `src/app/page.tsx`
   - `src/components/home/`
   - `src/app/profil/`

Tampilkan daftar file + baris yang perlu diperbaiki.
