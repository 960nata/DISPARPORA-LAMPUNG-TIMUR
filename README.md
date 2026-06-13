# Portal Pariwisata Lampung Timur (WANDER.lamtim) & SIMAD Admin

Website portal resmi Dinas Pariwisata, Pemuda, dan Olahraga (Disparpora) Kabupaten Lampung Timur untuk mempromosikan pariwisata daerah sekaligus mengelola administrasi internal melalui sistem SIMAD.

## Fitur Utama

- **Peta Wisata Interaktif**: Navigasi dan pemetaan lokasi wisata, kuliner, dan akomodasi terintegrasi Leaflet.js.
- **Divisi Layanan**: Tampilan akordion responsif untuk 5 bidang dinas dengan transisi pegas.
- **Carousel & Galeri**: Galeri visual auto-scroll marquee dan carousel destinasi tak terbatas (infinite).
- **SIMAD Admin**: Dashboard manajemen konten (CRUD) berita, agenda, direktori, dan data pegawai beserta visualisasi data (ApexCharts).

## Stack Teknologi

- **Framework**: Next.js 16 (App Router) & React 19
- **Animasi**: Framer Motion 12
- **Pemetaan**: Leaflet.js & React-Leaflet
- **Chart**: ApexCharts & React-ApexCharts
- **Database / ORM**: Prisma ORM
- **Desain & Ikon**: Lucide React & Custom CSS

## Struktur Folder Utama

- `src/app`: Logika halaman utama, rute API, peta, berita, dan dashboard.
- `src/components`: Komponen modular antarmuka publik dan admin.
- `src/lib` & `src/data`: Utilitas database Prisma dan penyimpanan berkas lokal.
- `public`: Aset gambar dan logo instansi.

## Cara Menjalankan Project

1. **Instalasi Paket**:
   ```bash
   npm install
   ```

2. **Inisialisasi Database (Prisma)**:
   ```bash
   npx prisma generate
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```
