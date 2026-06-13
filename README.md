# 🐘 DISPARPORA LAMPUNG TIMUR
> **WANDER.lamtim - Portal Resmi Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur & SIMAD (Sistem Manajemen Terpadu)**

Selamat datang di repositori resmi portal informasi pariwisata, pemuda, dan olahraga Kabupaten Lampung Timur. Proyek ini menggabungkan portal publik interaktif bernilai estetika premium (**WANDER.lamtim**) dengan sistem administrasi konten terpadu khusus internal staff (**SIMAD**).

---

## 📸 Tampilan Utama
Portal ini dirancang dengan gaya modern **minimalis-bersih (pure white background)** yang memadukan warna hijau alam (*Emerald*) khas Lampung Timur, tipografi elegan menggunakan font *Plus Jakarta Sans*, serta transisi animasi tingkat tinggi.

---

## 🚀 Fitur Utama

### 1. Portal Publik (WANDER.lamtim)
*   **Hero Section Dinamis**: Header premium dengan latar belakang gradien menyala, transisi halus, dan akses cepat ke Peta Wisata serta Direktori.
*   **5 Bidang & Layanan Dinas**: Modul akordion interaktif (Sekretariat, Ekonomi Kreatif, Pariwisata, Pemuda, & Olahraga) dengan animasi masuk *staggered spring* dari arah kiri.
*   **Destinasi Terpopuler (Infinite Carousel)**: Carousel penuh (full-bleed) tanpa batas (*infinite loop*) yang menampilkan 6 destinasi ikonik, dengan kartu visual yang otomatis menyesuaikan resolusi layar (hingga 6 kolom pada layar FHD) serta efek meluncur staggered dari kanan.
*   **Peta Wisata Interaktif (GIS)**: Pemetaan lokasi wisata (alam, budaya, buatan), hotel, dan kuliner menggunakan integrasi peta **Leaflet.js** yang dilengkapi filter dinamis, fitur pencarian cepat, serta jendela pop-up detail.
*   **Galeri Visual (Double-Row Marquee)**: Galeri foto otomatis dua baris (baris atas berjalan ke kiri, baris bawah berjalan ke kanan) dengan kecepatan konstan yang lembut dan otomatis berhenti sementara saat kursor diarahkan (*pause on hover*).
*   **Direktori Wisata Lengkap**: Daftar direktori destinasi, kuliner, dan akomodasi dengan pencarian, pemfilteran kategori, dan visualisasi lencana rating.
*   **Informasi Berita & Agenda**: Publikasi agenda kegiatan dinas serta stack berita terpopuler terintegrasi database.

### 2. Portal Admin (SIMAD - Sistem Manajemen Terpadu)
*   **Autentikasi & Keamanan**: Layanan login aman khusus staff administrasi Disparpora dengan opsi *bypass login* cepat untuk keperluan pengujian lokal.
*   **Dashboard Statistik (ApexCharts)**: Visualisasi metrik total kunjungan, sebaran berita, kemajuan divisi, serta bagan lingkaran dan garis interaktif.
*   **Manajemen Konten Terintegrasi (CRUD)**:
    *   Kelola Wisata & Akomodasi (Direktori)
    *   Kelola Berita & Berita Utama (*Highlight*)
    *   Kelola Instansi Mitra (*Partners*)
    *   Kelola Data Pegawai & Akun Staff

---

## 🛠️ Teknologi yang Digunakan

*   **Framework Utama**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Animasi & Transisi**: [Framer Motion 12](https://www.framer.com/motion/) (Animasi staggered, spring physics, dan viewport triggers)
*   **Peta Interaktif**: [Leaflet.js](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
*   **Visualisasi Data**: [ApexCharts](https://apexcharts.com/) & [React-ApexCharts](https://github.com/apexcharts/react-apexcharts)
*   **ORM / Database**: [Prisma ORM](https://www.prisma.io/) terintegrasi dengan struktur JSON Store.
*   **Desain & Ikonografi**: [Lucide React Icons](https://lucide.dev/)
*   **Sistem Styling**: Vanilla CSS & custom variables.

---

## 📁 Struktur Direktori
```text
pariwisata/
├── src/
│   ├── app/                      # Rute Utama & Halaman Next.js (layout, berita, peta, dashboard, dsb.)
│   │   ├── globals.css           # Sistem desain global & animasi marquee
│   │   ├── layout.tsx            # Kerangka dasar web & konfigurasi Favicon
│   │   └── page.tsx              # Halaman Beranda (Homepage) utama
│   ├── components/               # Komponen Modular reusable
│   │   ├── Header.tsx            # Header Navigasi + Tombol "Eksplor Peta"
│   │   ├── Footer.tsx            # Footer instansi
│   │   └── home/                 # Sub-section halaman utama (Hero, Destinations, Gallery, dll.)
│   ├── data/                     # Sumber data json & backup database lokal
│   └── lib/                      # Utilitas konfigurasi prisma & database seed
├── public/                       # Aset gambar, ikon, dan logo.avif
├── prisma/                       # Skema database relasional Prisma
├── package.json                  # Dependensi proyek
└── next.config.ts                # Konfigurasi Next.js
```

---

## ⚙️ Cara Menjalankan Secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas) dan **npm** di komputer Anda.

### Langkah-langkah
1.  **Clone Repositori**:
    ```bash
    git clone https://github.com/username/pariwisata.git
    cd pariwisata
    ```

2.  **Instal Dependensi**:
    ```bash
    npm install
    ```

3.  **Inisialisasi Database (Prisma)**:
    Untuk mengaktifkan database lokal:
    ```bash
    npx prisma generate
    ```

4.  **Jalankan Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

5.  **Build Produksi**:
    Untuk memeriksa dan mengompilasi bundel produksi:
    ```bash
    npm run build
    ```

---

## 📝 Lisensi
Proyek ini dibuat untuk mendukung digitalisasi pariwisata daerah. Hak Cipta dilindungi oleh **Dinas Pariwisata, Pemuda, dan Olahraga Kabupaten Lampung Timur**.
