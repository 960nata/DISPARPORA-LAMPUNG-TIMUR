import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Path for the local JSON database file (fallback)
const JSON_DB_PATH = path.join(process.cwd(), "src/data/db_store.json");

// Define typescript interfaces matching our models
export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: string; // "superadmin", "admin_dinas", "admin_post"
  permissions?: string; // JSON serialized UserPermissions
}

export interface Destination {
  id: string;
  name: string;
  category: string;
  kecamatan: string;
  address: string;
  lat: number;
  lng: number;
  active: boolean;
  facilities: string; // comma-separated
  contact: string;
  map_link?: string;
  classification?: string;
  rooms?: number;
  food_type?: string;
  capacity?: number;
  imageUrl?: string;
  description?: string;
  slug?: string;
  gallery?: string[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  status: string; // "draft", "published"
  tags: string; // comma-separated
  seoTitle?: string;
  seoDesc?: string;
  publishDate?: string; // ISO date (yyyy-mm-dd) chosen by editor
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;   // Alam, Bahari, Budaya, Sejarah, ...
  imageUrl: string;   // /Gallery/xxx.avif
  order: number;
  createdAt: string;
}

export interface Official {
  id: string;
  name: string;
  title: string;
  role: string;
  photoUrl?: string;
  order: number;
}

export interface Speech {
  id: string;
  name: string;
  title: string;
  badge: string;
  photoUrl: string;
  welcomeSpeech: string;
  order: number;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  status: "Mendatang" | "Selesai";
  image?: string;
}

interface JsonDatabaseSchema {
  users: User[];
  destinations: Destination[];
  posts: Post[];
  partners: Partner[];
  gallery: GalleryItem[];
  officials: Official[];
  speeches: Speech[];
  events: AppEvent[];
}

function seedOfficials(): Official[] {
  return [
    { id: "off_1", name: "Marsan, S.Pd., Ing., M.Pd.", title: "Kepala Dinas", role: "Kepala Dinas Pariwisata, Kepemudaan dan Olahraga", photoUrl: "/leaders/kadis.avif", order: 0 },
    { id: "off_2", name: "Sekretariat", title: "Sekretaris Dinas", role: "Administrasi & Operasional", photoUrl: "", order: 1 },
    { id: "off_3", name: "Bidang Pariwisata", title: "Kepala Bidang", role: "Pengembangan Destinasi", photoUrl: "", order: 2 },
    { id: "off_4", name: "Bidang Ekonomi Kreatif", title: "Kepala Bidang", role: "Industri & Kriya Kreatif", photoUrl: "", order: 3 },
    { id: "off_5", name: "Bidang Kepemudaan", title: "Kepala Bidang", role: "Pemberdayaan Pemuda", photoUrl: "", order: 4 },
    { id: "off_6", name: "Bidang Keolahragaan", title: "Kepala Bidang", role: "Pembinaan Prestasi", photoUrl: "", order: 5 },
  ];
}

function seedSpeeches(): Speech[] {
  return [
    { id: "sp_1", name: "Ela Siti Nuryamah", title: "Bupati Lampung Timur", badge: "Sambutan Bupati", photoUrl: "/leaders/bupati.png", welcomeSpeech: "Tabik Pun! Selamat datang di Portal Wisata resmi Kabupaten Lampung Timur. Kami mengundang seluruh wisatawan untuk datang dan menyaksikan sendiri kekayaan alam liar yang mempesona di Taman Nasional Way Kambas, keindahan bahari pantai pesisir timur, serta peninggalan prasejarah yang bernilai tinggi. Lampung Timur terus berinovasi dalam memajukan pemuda, olahraga, dan industri ekonomi kreatif lokal demi mewujudkan masyarakat yang sejahtera dan berbudaya.", order: 0 },
    { id: "sp_2", name: "Azwar Hadi", title: "Wakil Bupati Lampung Timur", badge: "Sambutan Wakil Bupati", photoUrl: "/leaders/wabup.png", welcomeSpeech: "Selamat datang di platform digital pariwisata, kepemudaan, dan olahraga Lampung Timur. Melalui sinergi yang kuat antara pengembangan pariwisata terpadu, pemberdayaan pemuda yang inovatif, serta pembinaan olahraga yang konsisten, kami bertekad membawa Lampung Timur menjadi daerah yang unggul dan berdaya saing.", order: 1 },
    { id: "sp_3", name: "Marsan, S.Pd., Ing., M.Pd.", title: "Kepala Dinas Pariwisata, Kepemudaan dan Olahraga", badge: "Sambutan Kepala Dinas", photoUrl: "/leaders/kadis.avif", welcomeSpeech: "Tabik Pun! Atas nama Dinas Pariwisata, Kepemudaan, dan Olahraga Kabupaten Lampung Timur, kami menyambut hangat kehadiran Anda di portal ini. Tugas kami adalah mengemas potensi alam, budaya, dan sejarah Lampung Timur menjadi destinasi wisata unggulan.", order: 2 },
  ];
}

function seedEvents(): AppEvent[] {
  return [
    { id: "ev_1", title: "Festival Way Kambas 2026", date: "24 - 26 Oktober 2026", location: "Pusat Latihan Gajah, Way Kambas", desc: "Perayaan tahunan konservasi gajah Sumatera, pentas seni adat, dan pameran kriya kreatif UMKM.", status: "Mendatang", image: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=400&q=80" },
    { id: "ev_2", title: "Ritual Melasti Bahari", date: "12 Maret 2026", location: "Pantai Kerang Mas, Labuhan Maringgai", desc: "Upacara keagamaan adat umat Hindu Lampung Timur di pesisir timur yang penuh warna dan khidmat.", status: "Selesai", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" },
    { id: "ev_3", title: "Pentas Adat Begawi Desa Wana", date: "15 Agustus 2026", location: "Desa Adat Wana, Melinting", desc: "Gelar ritual adat Begawi Suku Lampung Melinting, menyajikan Tari Melinting klasik dan musik perkusi cetik.", status: "Mendatang", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
  ];
}

// Check if we have PostgreSQL configured
const isPgConfigured = !!process.env.DATABASE_URL;

let prismaClient: any;
if (isPgConfigured) {
  prismaClient = new PrismaClient();
}

// Seed gallery mirrors the current homepage GallerySection photos
function seedGallery(): GalleryItem[] {
  const now = new Date().toISOString();
  const items: Omit<GalleryItem, "id" | "order" | "createdAt">[] = [
    { title: "Panorama Alam Lampung Timur", category: "Alam",    imageUrl: "/Gallery/hero1.avif" },
    { title: "Keindahan Destinasi Wisata",  category: "Alam",    imageUrl: "/Gallery/1.avif" },
    { title: "Pesona Wisata Daerah",        category: "Alam",    imageUrl: "/Gallery/2.avif" },
    { title: "Pantai Dewi Mandapa",         category: "Bahari",  imageUrl: "/Gallery/Pantai Dewi Mandapa.avif" },
    { title: "Keasrian Alam Terbuka",       category: "Alam",    imageUrl: "/Gallery/3.avif" },
    { title: "Air Terjun Way Guruh",        category: "Alam",    imageUrl: "/Gallery/Way Guruh.avif" },
    { title: "Wisata Budaya Lampung Timur", category: "Budaya",  imageUrl: "/Gallery/image.avif" },
    { title: "Pantai Kerang Mas",           category: "Bahari",  imageUrl: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif" },
    { title: "Atraksi Budaya Lokal",        category: "Budaya",  imageUrl: "/Gallery/4.avif" },
    { title: "Situs Purbakala Lampung Timur", category: "Sejarah", imageUrl: "/Gallery/pugung_raharjo.avif" },
    { title: "Pesona Alam Liar Way Kambas", category: "Alam",    imageUrl: "/Gallery/hero3.avif" },
    { title: "Destinasi Wisata Unggulan",   category: "Alam",    imageUrl: "/Gallery/image copy.avif" },
    { title: "Keindahan Alam Daerah",       category: "Alam",    imageUrl: "/Gallery/image copy 2.avif" },
  ];
  return items.map((it, i) => ({ id: `gal_${i + 1}`, order: i, createdAt: now, ...it }));
}

// ----------------------------------------------------
// Fallback Mock JSON Database Engine
// ----------------------------------------------------
class JsonDbEngine {
  private data: JsonDatabaseSchema = { users: [], destinations: [], posts: [], partners: [], gallery: [], officials: [], speeches: [], events: [] };

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      // Ensure data folder exists
      const dir = path.dirname(JSON_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(JSON_DB_PATH)) {
        const fileContent = fs.readFileSync(JSON_DB_PATH, "utf-8");
        this.data = JSON.parse(fileContent);
        // Migration: older db files may not have a gallery collection yet
        if (!this.data.gallery) {
          this.data.gallery = seedGallery();
          this.saveData();
        }
        if (!this.data.officials) { this.data.officials = seedOfficials(); this.saveData(); }
        if (!this.data.speeches) { this.data.speeches = seedSpeeches(); this.saveData(); }
        if (!this.data.events) { this.data.events = seedEvents(); this.saveData(); }
      } else {
        this.seedInitialData();
      }
    } catch (e) {
      console.error("Error reading JSON Database, falling back to memory:", e);
      this.seedInitialData();
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing JSON Database:", e);
    }
  }

  private seedInitialData() {
    // 1. Seed Users (with mock roles)
    const seedUsers: User[] = [
      { id: "usr_superadmin", username: "superadmin", password: "password123", name: "Super Admin Dinas", role: "superadmin" },
      { id: "usr_admindinas", username: "admindinas", password: "password123", name: "Admin Bidang Dinas", role: "admin_dinas" },
      { id: "usr_adminpost", username: "adminpost", password: "password123", name: "Editor Berita Dinas", role: "admin_post" }
    ];

    // 2. Seed Destinations (Load parsed destinations from tourism.json)
    let seedDestinations: Destination[] = [];
    try {
      const tourismPath = path.join(process.cwd(), "src/data/tourism.json");
      if (fs.existsSync(tourismPath)) {
        const raw = JSON.parse(fs.readFileSync(tourismPath, "utf-8"));
        const combined = [
          ...raw.wisata_alam.map((i: any) => ({ ...i, category: "Wisata Alam" })),
          ...raw.wisata_buatan.map((i: any) => ({ ...i, category: "Wisata Buatan" })),
          ...raw.wisata_budaya.map((i: any) => ({ ...i, category: "Wisata Budaya" })),
          ...raw.hotels.map((i: any) => ({ ...i, category: "Akomodasi" }))
        ];
        seedDestinations = combined.map((item: any) => ({
          id: item.id || `spot_${Math.random()}`,
          name: item.name || "",
          category: item.category || "Wisata Alam",
          kecamatan: item.kecamatan || "Sukadana",
          address: item.address || "",
          lat: Number(item.lat || 0),
          lng: Number(item.lng || 0),
          active: item.active !== undefined ? item.active : true,
          facilities: Array.isArray(item.facilities) ? item.facilities.join(", ") : "",
          contact: item.contact || "",
          map_link: item.map_link || "",
          classification: item.classification || "Non Bintang",
          rooms: Number(item.rooms || 10)
        }));
      }
    } catch (e) {
      console.error("Failed to seed destinations from tourism.json:", e);
    }

    const seedPosts: Post[] = [
      {
        id: "post_1",
        title: "Festival Way Kambas Kembali Digelar Tahun Ini",
        slug: "festival-way-kambas-kembali-digelar-tahun-ini",
        content: "Pemerintah Kabupaten Lampung Timur melalui Dinas Pariwisata mengumumkan kembalinya gelaran tahunan legendaris, Festival Way Kambas. Event ini akan menampilkan atraksi edukasi gajah Sumatera, parade kebudayaan adat Lampung, pameran produk kriya kreatif khas daerah, serta kompetisi olahraga pemuda. Festival ini bertujuan membangkitkan gairah wisata alam dan konservasi liar di Way Kambas.",
        imageUrl: "/Gallery/hero3.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Festival, Way Kambas, Konservasi, Wisata Alam, Pariwisata"
      },
      {
        id: "post_2",
        title: "Pantai Kerang Mas Alami Lonjakan Pengunjung Sepanjang Libur Lebaran",
        slug: "pantai-kerang-mas-alami-lonjakan-pengunjung-sepanjang-libur-lebaran",
        content: "Destinasi wisata bahari andalan Lampung Timur, Pantai Kerang Mas, mencatat rekor kunjungan wisatawan tertinggi selama liburan pekan ini. Ribuan wisatawan lokal dan luar daerah memadati pantai untuk menikmati gazebo pesisir, kuliner tangkapan laut segar, penyewaan ban, serta wahana ATV. Pokdarwis setempat menyatakan kesiapan keamanan pantai telah dioptimalkan guna mengantisipasi ramainya pelancong.",
        imageUrl: "/Gallery/Pantai-Kerang-Mas-Labuhan-Maringgai-Lampung-Timur-desmonjosbur-1602765547466.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Pantai, Kerang Mas, Wisata Alam, Lebaran, Pariwisata"
      },
      {
        id: "post_3",
        title: "Pembinaan & Sertifikasi Pemandu Wisata Desa Wisata Lampung Timur",
        slug: "pembinaan-sertifikasi-pemandu-wisata-desa-wisata-lampung-timur",
        content: "Dalam rangka meningkatkan mutu layanan hospitality, Bidang Pengembangan Destinasi Dinas Pariwisata Lampung Timur menyelenggarakan pembinaan intensif dan sertifikasi bagi 40 pemandu desa wisata. Program ini melibatkan desa wisata binaan seperti Braja Harjosari dan Desa Tradisional Wana. Pemandu dibekali keahlian story-telling adat, keselamatan pelancong, serta pemanfaatan media promosi.",
        imageUrl: "/Gallery/hero1.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Pelatihan, Pemandu, Desa Wisata, Sertifikasi, Pariwisata"
      },
      {
        id: "post_4",
        title: "Ekspor Kerajinan Tapis Lampung Timur Tumbuh Pesat Didorong Pasar Digital",
        slug: "ekspor-tapis-lampung-timur-tumbuh-pesat",
        content: "Kerajinan kain tapis khas Lampung Timur mengalami lonjakan permintaan ekspor luar negeri sepanjang triwulan pertama tahun ini, didukung program Go Digital dari Dinas Pariwisata dan Ekonomi Kreatif. Pelaku UMKM tapis di Kecamatan Sukadana dan Batanghari mampu memasarkan produk ke Jepang, Eropa, dan Australia melalui marketplace internasional.",
        imageUrl: "/Gallery/tapis_lampung.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kriya, Tapis, Ekraf, Ekspor"
      },
      {
        id: "post_5",
        title: "Taman Nasional Way Kambas Terima 12.000 Wisatawan Selama Mei 2026",
        slug: "taman-nasional-way-kambas-terima-12000-wisatawan-mei-2026",
        content: "Balai Taman Nasional Way Kambas mencatat sebanyak 12.000 wisatawan berkunjung sepanjang Mei 2026, naik 35% dari bulan sebelumnya. Peningkatan ini didorong oleh program tiket terusan nasional dan paket edukasi konservasi gajah Sumatera untuk rombongan sekolah. Fasilitas boardwalk baru di zona inti juga menjadi daya tarik tambahan bagi pecinta fotografi satwa liar.",
        imageUrl: "/Gallery/Taman Nasional Way Kambas.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Way Kambas, Konservasi, Wisata Alam, Pariwisata"
      },
      {
        id: "post_6",
        title: "Kejuaraan Sepak Bola Antar Kecamatan Resmi Dibuka Bupati",
        slug: "kejuaraan-sepak-bola-antar-kecamatan-resmi-dibuka",
        content: "Bupati Lampung Timur secara resmi membuka Kejuaraan Sepak Bola Antar Kecamatan 2026 di Stadion Sukadana. Sebanyak 24 tim dari seluruh kecamatan berpartisipasi dalam turnamen yang berlangsung selama tiga pekan. Kejuaraan ini merupakan bagian dari program pembinaan olahraga pemuda daerah yang dikelola oleh Bidang Kepemudaan dan Olahraga DISPARPORA.",
        imageUrl: "/Gallery/5.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Olahraga, Kepemudaan, Sepak Bola"
      },
      {
        id: "post_7",
        title: "Wisata Mangrove Pasir Sakti Raih Penghargaan ASEAN Eco-Tourism",
        slug: "wisata-mangrove-pasir-sakti-raih-penghargaan-asean",
        content: "Kawasan Ekowisata Mangrove Pasir Sakti berhasil meraih penghargaan ASEAN Eco-Tourism Award 2026 kategori Community-Based Tourism. Penghargaan ini diberikan atas keberhasilan masyarakat lokal dalam mengembangkan wisata berbasis konservasi hutan bakau yang berkelanjutan. Kawasan ini menyediakan jalur trekking mangrove sepanjang 2 kilometer, spot foto instagramable, serta pusat edukasi ekosistem pesisir.",
        imageUrl: "/Gallery/mangrove_pasir_sakti.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Wisata Alam, Konservasi, Mangrove, Pariwisata"
      },
      {
        id: "post_8",
        title: "Danau Beringin Indah Dikembangkan Jadi Destinasi Glamping Premium",
        slug: "danau-beringin-indah-dikembangkan-jadi-glamping-premium",
        content: "Dinas Pariwisata Lampung Timur menggandeng investor swasta untuk mengembangkan kawasan Danau Beringin Indah menjadi destinasi glamping premium. Proyek senilai Rp 8,5 miliar ini akan menyediakan 20 unit tenda mewah berkonsep eco-lodge, restoran apung, dan dermaga perahu wisata. Pembangunan ditargetkan selesai akhir 2026 dan diharapkan meningkatkan PAD sektor pariwisata sebesar 40%.",
        imageUrl: "/Gallery/Danau Beringin Indah.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Wisata Alam, Infrastruktur, Pariwisata, Investasi"
      },
      {
        id: "post_9",
        title: "Pekan Kuliner Nusantara Lampung Timur Hadirkan 200 Stan UMKM",
        slug: "pekan-kuliner-nusantara-lampung-timur-200-stan-umkm",
        content: "Pekan Kuliner Nusantara Lampung Timur 2026 sukses digelar selama lima hari di Alun-alun Sukadana. Sebanyak 200 stan UMKM kuliner dari berbagai kecamatan menyajikan menu khas daerah seperti seruit, gulai taboh, pindang kuning, dan kopi robusta Lampung Timur. Acara ini juga dimeriahkan dengan lomba memasak, demo chef, dan pertunjukan tari tradisional.",
        imageUrl: "/Gallery/4.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kuliner, Ekraf, Festival, UMKM"
      },
      {
        id: "post_10",
        title: "Air Terjun Way Guruh Masuk 10 Besar Destinasi Terpopuler Sumatera",
        slug: "air-terjun-way-guruh-masuk-10-besar-destinasi-terpopuler",
        content: "Air Terjun Way Guruh yang berlokasi di Kecamatan Labuhan Ratu berhasil masuk dalam daftar 10 Besar Destinasi Wisata Alam Terpopuler di Sumatera versi Kementerian Pariwisata. Keindahan air terjun setinggi 30 meter dengan kolam alami di bawahnya menjadi magnet bagi wisatawan yang mencari pengalaman alam autentik. Akses jalan menuju lokasi telah diperbaiki dengan pengaspalan sepanjang 5 km.",
        imageUrl: "/Gallery/Way Guruh.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Wisata Alam, Way Guruh, Pariwisata"
      },
      {
        id: "post_11",
        title: "Situs Purbakala Pugung Raharjo Gelar Pameran Arkeologi Interaktif",
        slug: "situs-purbakala-pugung-raharjo-pameran-arkeologi-interaktif",
        content: "Museum Situs Purbakala Pugung Raharjo bekerja sama dengan Balai Pelestarian Cagar Budaya Lampung menggelar pameran arkeologi interaktif bertema 'Jejak Peradaban Lampung Timur'. Pengunjung dapat melihat koleksi artefak prasejarah, replika megalitik, dan mengikuti workshop ekskavasi mini untuk anak-anak. Pameran berlangsung selama satu bulan dan terbuka untuk umum dengan tiket masuk gratis.",
        imageUrl: "/Gallery/pugung_raharjo.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Sejarah, Budaya, Arkeologi, Pariwisata"
      },
      {
        id: "post_12",
        title: "Program Karang Taruna Kreatif Lahirkan 50 Wirausahawan Muda Baru",
        slug: "program-karang-taruna-kreatif-lahirkan-50-wirausahawan-muda",
        content: "Program Karang Taruna Kreatif yang digagas Bidang Kepemudaan DISPARPORA Lampung Timur berhasil melahirkan 50 wirausahawan muda baru di bidang kuliner, kerajinan, dan jasa wisata. Para peserta mendapatkan pelatihan business plan, pemasaran digital, dan modal usaha awal masing-masing Rp 5 juta. Program ini menargetkan penurunan angka pengangguran pemuda usia 18-30 tahun.",
        imageUrl: "/Gallery/image.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kepemudaan, Ekraf, Wirausaha"
      },
      {
        id: "post_13",
        title: "Pantai Dewi Mandapa Luncurkan Paket Wisata Sunset Kayaking",
        slug: "pantai-dewi-mandapa-luncurkan-paket-sunset-kayaking",
        content: "Pengelola Pantai Dewi Mandapa meluncurkan paket wisata baru bertajuk Sunset Kayaking yang menawarkan pengalaman mendayung kayak di perairan tenang saat matahari terbenam. Paket seharga Rp 75.000 per orang ini sudah termasuk penyewaan kayak, jaket pelampung, dan pemandu lokal. Aktivitas ini menjadi andalan baru untuk menarik wisatawan milenial yang gemar aktivitas outdoor.",
        imageUrl: "/Gallery/Pantai Dewi Mandapa.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Pantai, Wisata Alam, Pariwisata"
      },
      {
        id: "post_14",
        title: "Lomba Voli Pantai Piala Bupati Diikuti 32 Tim dari Seluruh Lampung",
        slug: "lomba-voli-pantai-piala-bupati-diikuti-32-tim",
        content: "Kejuaraan Voli Pantai Piala Bupati Lampung Timur 2026 diikuti oleh 32 tim dari seluruh kabupaten/kota di Provinsi Lampung. Pertandingan berlangsung di arena pasir Pantai Mutiara Baru dengan fasilitas tribun penonton berkapasitas 1.000 orang. Total hadiah senilai Rp 100 juta diperebutkan oleh para atlet terbaik daerah. Kejuaraan ini menjadi ajang pencarian bakat olahraga tingkat provinsi.",
        imageUrl: "/Gallery/Pantai Mutiara Baru.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Olahraga, Pantai, Kepemudaan"
      },
      {
        id: "post_15",
        title: "Dam Negara Batin Wanaba Jadi Spot Wisata Memancing Favorit",
        slug: "dam-negara-batin-wanaba-spot-wisata-memancing-favorit",
        content: "Dam Negara Batin Wanaba yang awalnya dibangun untuk irigasi pertanian kini berkembang menjadi spot wisata memancing yang diminati warga. Dinas Pariwisata mendukung pengembangan kawasan ini dengan menambah fasilitas gazebo, area parkir, dan warung makan ikan bakar. Kegiatan lomba memancing rutin diadakan setiap bulan untuk meningkatkan kunjungan wisatawan domestik.",
        imageUrl: "/Gallery/Dam Negara Batin  Wanaba.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Wisata Alam, Pariwisata, Infrastruktur"
      },
      {
        id: "post_16",
        title: "Nuwo Sesat Adat Lampung Timur Diresmikan Sebagai Pusat Kebudayaan",
        slug: "nuwo-sesat-adat-lampung-timur-diresmikan-pusat-kebudayaan",
        content: "Bupati Lampung Timur meresmikan Nuwo Sesat Adat sebagai Pusat Kebudayaan Lampung Timur. Bangunan rumah adat ini akan berfungsi sebagai museum mini kebudayaan Lampung, ruang pertunjukan tari dan musik tradisional, serta tempat pelaksanaan upacara adat. Pembangunan senilai Rp 3,2 miliar ini dibiayai oleh APBD dan merupakan ikon baru pariwisata budaya daerah.",
        imageUrl: "/Gallery/nuwo_sesat.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Budaya, Sejarah, Pariwisata"
      },
      {
        id: "post_17",
        title: "Pelatihan Digital Marketing untuk Pelaku Wisata Desa",
        slug: "pelatihan-digital-marketing-pelaku-wisata-desa",
        content: "Sebanyak 80 pelaku usaha wisata dari 15 desa wisata di Lampung Timur mengikuti pelatihan digital marketing yang diselenggarakan DISPARPORA bekerja sama dengan Google Indonesia. Materi pelatihan meliputi optimasi Google Maps, pembuatan konten Instagram Reels, pengelolaan review wisatawan, dan penggunaan platform booking online. Program ini bertujuan meningkatkan visibilitas desa wisata di kanal digital.",
        imageUrl: "/Gallery/1.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Pelatihan, Desa Wisata, Ekraf, Pariwisata"
      },
      {
        id: "post_18",
        title: "Sumber Mata Air Awet Muda Tarik Perhatian Wisatawan Mancanegara",
        slug: "sumber-mata-air-awet-muda-tarik-wisatawan-mancanegara",
        content: "Objek wisata Sumber Mata Air Awet Muda di Kecamatan Way Jepara semakin populer di kalangan wisatawan mancanegara, terutama dari Malaysia dan Singapura. Sumber air alami dengan suhu sejuk di tengah hutan ini dipercaya memiliki khasiat menyegarkan kulit. Dinas Pariwisata berencana menambah papan informasi multibahasa dan pusat informasi untuk memudahkan wisatawan asing.",
        imageUrl: "/Gallery/Sumber Mata Air Awet Muda.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Wisata Alam, Pariwisata"
      },
      {
        id: "post_19",
        title: "Lampung Timur Tuan Rumah Kejuaraan Atletik Pelajar Se-Sumatera",
        slug: "lampung-timur-tuan-rumah-kejuaraan-atletik-pelajar",
        content: "Kabupaten Lampung Timur terpilih menjadi tuan rumah Kejuaraan Atletik Pelajar Se-Sumatera 2026. Sebanyak 450 atlet muda dari 10 provinsi berlaga di Stadion Sukadana yang baru direnovasi. Cabang lomba meliputi lari sprint, lompat jauh, tolak peluru, dan estafet. Kepala DISPARPORA menyatakan event ini menjadi bukti kesiapan Lampung Timur sebagai kota olahraga.",
        imageUrl: "/Gallery/3.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Olahraga, Kepemudaan, Atletik"
      },
      {
        id: "post_20",
        title: "Kopi Robusta Lampung Timur Tembus Pasar Korea Selatan",
        slug: "kopi-robusta-lampung-timur-tembus-pasar-korea-selatan",
        content: "Kopi robusta dari perkebunan rakyat Lampung Timur berhasil menembus pasar Korea Selatan setelah lolos sertifikasi internasional. Ekspor perdana sebanyak 20 ton dikirim melalui Pelabuhan Panjang. Keberhasilan ini merupakan hasil kolaborasi antara kelompok tani kopi, Dinas Pertanian, dan DISPARPORA dalam program promosi produk unggulan daerah melalui pameran internasional.",
        imageUrl: "/Gallery/image copy.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Ekraf, Kuliner, Ekspor"
      },
      {
        id: "post_21",
        title: "Desa Wisata Braja Harjosari Raih Predikat CHSE dari Kemenparekraf",
        slug: "desa-wisata-braja-harjosari-raih-predikat-chse",
        content: "Desa Wisata Braja Harjosari resmi meraih sertifikasi CHSE (Cleanliness, Health, Safety, Environment) dari Kementerian Pariwisata dan Ekonomi Kreatif. Sertifikasi ini menandakan bahwa desa wisata tersebut telah memenuhi standar protokol kesehatan dan keselamatan wisatawan. Atraksi unggulan desa ini meliputi agrowisata padi organik, homestay tradisional, dan workshop pembuatan kue tradisional.",
        imageUrl: "/Gallery/2.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Desa Wisata, Sertifikasi, Pariwisata"
      },
      {
        id: "post_22",
        title: "Parade Budaya Lampung Timur Peringati Hari Jadi Kabupaten ke-26",
        slug: "parade-budaya-lampung-timur-hari-jadi-kabupaten-ke-26",
        content: "Dalam rangka memperingati Hari Jadi Kabupaten Lampung Timur ke-26, pemerintah daerah menggelar Parade Budaya yang melibatkan 24 kecamatan. Setiap kecamatan menampilkan kesenian dan budaya khasnya masing-masing, mulai dari tari cangget, sigeh pengunten, hadra, hingga pencak silat. Parade sepanjang 3 km ini disaksikan oleh ribuan warga dan wisatawan.",
        imageUrl: "/Gallery/image copy 2.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Budaya, Festival, Pariwisata"
      },
      {
        id: "post_23",
        title: "Pembangunan Jembatan Wisata Way Sekampung Rampung Akhir Juni",
        slug: "pembangunan-jembatan-wisata-way-sekampung-rampung-juni",
        content: "Pembangunan jembatan gantung wisata di atas Sungai Way Sekampung ditargetkan rampung akhir Juni 2026. Jembatan sepanjang 120 meter ini akan menghubungkan dua titik wisata alam dan menjadi ikon selfie baru Lampung Timur. Proyek senilai Rp 2,8 miliar ini diharapkan mendongkrak kunjungan wisatawan ke kawasan hulu Way Sekampung yang kaya panorama alam.",
        imageUrl: "/Gallery/hero1.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Infrastruktur, Wisata Alam, Pariwisata"
      },
      {
        id: "post_24",
        title: "Workshop Fotografi Wisata untuk Komunitas Pemuda Lampung Timur",
        slug: "workshop-fotografi-wisata-komunitas-pemuda",
        content: "DISPARPORA Lampung Timur mengadakan workshop fotografi wisata selama tiga hari yang diikuti oleh 60 pemuda dari komunitas fotografi dan content creator lokal. Peserta diajak hunting foto ke beberapa destinasi unggulan seperti Way Kambas, Pantai Kerang Mas, dan Situs Pugung Raharjo. Hasil foto terbaik akan digunakan untuk materi promosi pariwisata daerah di media sosial resmi.",
        imageUrl: "/Gallery/hero3.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 74 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kepemudaan, Pelatihan, Pariwisata"
      },
      {
        id: "post_25",
        title: "Festival Seruit Masuk Kalender Wonderful Indonesia 2026",
        slug: "festival-seruit-masuk-kalender-wonderful-indonesia-2026",
        content: "Kementerian Pariwisata dan Ekonomi Kreatif resmi memasukkan Festival Seruit Lampung Timur ke dalam Kalender Wonderful Indonesia 2026. Festival kuliner khas ini akan digelar pada September mendatang dengan menampilkan 100 variasi sajian seruit dari seluruh kecamatan. Seruit, hidangan ikan bakar dengan sambal terasi dan lalapan, merupakan kuliner ikonik masyarakat pesisir Lampung.",
        imageUrl: "/Gallery/4.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 78 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kuliner, Festival, Pariwisata"
      },
      {
        id: "post_26",
        title: "Gajah Sumatera di Way Kambas Bertambah 3 Ekor Bayi Baru",
        slug: "gajah-sumatera-way-kambas-bertambah-3-ekor-bayi-baru",
        content: "Kabar gembira datang dari Pusat Latihan Gajah (PLG) Taman Nasional Way Kambas dengan kelahiran 3 ekor bayi gajah Sumatera dalam kurun waktu dua bulan terakhir. Ketiga bayi gajah dalam kondisi sehat dan aktif. Kelahiran ini meningkatkan populasi gajah di PLG menjadi 68 ekor. Balai TN Way Kambas mengundang masyarakat untuk ikut memberi nama melalui kompetisi daring.",
        imageUrl: "/Gallery/Taman Nasional Way Kambas.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 82 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Way Kambas, Konservasi, Wisata Alam"
      },
      {
        id: "post_27",
        title: "Museum Lampung Timur Koleksi 500 Artefak Bersejarah Baru",
        slug: "museum-lampung-timur-koleksi-500-artefak-bersejarah-baru",
        content: "Museum Daerah Lampung Timur menerima donasi 500 artefak bersejarah dari kolektor dan masyarakat setempat. Koleksi baru meliputi keramik abad ke-14, perhiasan perunggu masa Kerajaan Tulang Bawang, dan naskah kuno aksara Lampung. Kepala museum menyatakan penambahan koleksi ini akan memperkaya narasi sejarah peradaban Lampung di mata pengunjung domestik dan internasional.",
        imageUrl: "/Gallery/museum_lampung.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 86 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Sejarah, Budaya, Pariwisata"
      },
      {
        id: "post_28",
        title: "Seleksi Duta Wisata Lampung Timur 2026 Dibuka untuk Umum",
        slug: "seleksi-duta-wisata-lampung-timur-2026-dibuka",
        content: "DISPARPORA Lampung Timur membuka pendaftaran Seleksi Duta Wisata 2026 untuk pemuda-pemudi berusia 17-25 tahun. Para finalis akan menjalani karantina selama satu pekan dengan materi pengetahuan pariwisata, public speaking, dan kearifan lokal. Pemenang akan menjadi brand ambassador resmi pariwisata Lampung Timur dan mewakili daerah di tingkat provinsi serta nasional.",
        imageUrl: "/Gallery/image.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Kepemudaan, Pariwisata, Festival"
      },
      {
        id: "post_29",
        title: "Jalur Sepeda Wisata Sepanjang 25 Km Diresmikan di Pesisir Timur",
        slug: "jalur-sepeda-wisata-25-km-diresmikan-pesisir-timur",
        content: "Pemerintah Kabupaten Lampung Timur meresmikan jalur sepeda wisata (cycling track) sepanjang 25 km yang menghubungkan tiga pantai utama: Pantai Kerang Mas, Pantai Mutiara Baru, dan Pantai Dewi Mandapa. Jalur ini dilengkapi pos istirahat, penyewaan sepeda, dan papan informasi destinasi. Fasilitas ini diharapkan menjadi magnet baru bagi wisatawan yang menyukai sport tourism.",
        imageUrl: "/Gallery/Pantai Mutiara Baru.avif",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Infrastruktur, Olahraga, Pantai, Pariwisata"
      },
      {
        id: "post_30",
        title: "DISPARPORA Luncurkan Aplikasi Jelajah Lampung Timur",
        slug: "disparpora-luncurkan-aplikasi-jelajah-lampung-timur",
        content: "DISPARPORA Lampung Timur resmi meluncurkan aplikasi mobile 'Jelajah Lampung Timur' yang dapat diunduh gratis di Play Store dan App Store. Aplikasi ini menyediakan fitur peta interaktif destinasi wisata, booking tiket online, panduan kuliner, kalender event, dan virtual tour 360° untuk 10 destinasi unggulan. Pengembangan aplikasi merupakan bagian dari program Smart Tourism Lampung Timur 2026.",
        imageUrl: "/Gallery/1.avif",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        status: "published",
        tags: "Pariwisata, Ekraf, Infrastruktur"
      }
    ];

    // 4. Seed Partner Logos
    const seedPartners: Partner[] = [
      { id: "part_1", name: "Kemenparekraf RI", logoUrl: "/group_1.avif" },
      { id: "part_2", name: "Pemerintah Provinsi Lampung", logoUrl: "/group_4.avif" },
      { id: "part_3", name: "Pemerintah Kabupaten Lampung Timur", logoUrl: "/group_3.avif" },
      { id: "part_4", name: "Taman Nasional Way Kambas", logoUrl: "/group_2.avif" },
      { id: "part_5", name: "Bank Lampung", logoUrl: "/group_5.avif" },
      { id: "part_6", name: "Pokdarwis Lampung Timur", logoUrl: "/group_6.avif" },
      { id: "part_7", name: "Dinas Pariwisata Lampung Timur", logoUrl: "/group_7.avif" }
    ];

    this.data = {
      users: seedUsers,
      destinations: seedDestinations,
      posts: seedPosts,
      partners: seedPartners,
      gallery: seedGallery(),
      officials: seedOfficials(),
      speeches: seedSpeeches(),
      events: seedEvents()
    };
    this.saveData();
  }

  // --- CRUD API Interfaces ---
  
  // USERS
  public users = {
    findMany: async () => this.data.users,
    findUnique: async ({ where }: { where: { username?: string; id?: string } }) => {
      if (where.username) return this.data.users.find(u => u.username === where.username);
      if (where.id) return this.data.users.find(u => u.id === where.id);
      return null;
    },
    create: async ({ data }: { data: Omit<User, "id"> }) => {
      const newUser = { id: `usr_${Date.now()}`, ...data };
      this.data.users.push(newUser);
      this.saveData();
      return newUser;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<User> }) => {
      const idx = this.data.users.findIndex(u => u.id === where.id);
      if (idx !== -1) {
        this.data.users[idx] = { ...this.data.users[idx], ...data };
        this.saveData();
        return this.data.users[idx];
      }
      throw new Error("User not found");
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.users.find(u => u.id === where.id);
      this.data.users = this.data.users.filter(u => u.id !== where.id);
      this.saveData();
      return deleted;
    }
  };

  // DESTINATIONS
  public destinations = {
    findMany: async () => this.data.destinations,
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.data.destinations.find(d => d.id === where.id) ?? null;
    },
    create: async ({ data }: { data: Omit<Destination, "id"> }) => {
      const newDest = { id: `spot_${Date.now()}`, ...data };
      this.data.destinations.push(newDest);
      this.saveData();
      return newDest;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Destination> }) => {
      const idx = this.data.destinations.findIndex(d => d.id === where.id);
      if (idx !== -1) {
        this.data.destinations[idx] = { ...this.data.destinations[idx], ...data };
        this.saveData();
        return this.data.destinations[idx];
      }
      throw new Error("Destination not found");
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.destinations.find(d => d.id === where.id);
      this.data.destinations = this.data.destinations.filter(d => d.id !== where.id);
      this.saveData();
      return deleted;
    }
  };

  // POSTS (News CMS)
  public posts = {
    findMany: async () => this.data.posts,
    findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
      if (where.slug) return this.data.posts.find(p => p.slug === where.slug);
      if (where.id) return this.data.posts.find(p => p.id === where.id);
      return null;
    },
    create: async ({ data }: { data: Omit<Post, "id" | "createdAt"> }) => {
      // Find author name
      const author = this.data.users.find(u => u.id === data.authorId);
      const newPost = {
        id: `post_${Date.now()}`,
        createdAt: new Date().toISOString(),
        authorName: author ? author.name : "Editor",
        ...data
      };
      this.data.posts.push(newPost);
      this.saveData();
      return newPost;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Post> }) => {
      const idx = this.data.posts.findIndex(p => p.id === where.id);
      if (idx !== -1) {
        // If title changed, update slug
        let slug = this.data.posts[idx].slug;
        if (data.title) {
          slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }
        this.data.posts[idx] = { ...this.data.posts[idx], ...data, slug };
        this.saveData();
        return this.data.posts[idx];
      }
      throw new Error("Post not found");
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.posts.find(p => p.id === where.id);
      this.data.posts = this.data.posts.filter(p => p.id !== where.id);
      this.saveData();
      return deleted;
    }
  };

  // PARTNERS
  public partners = {
    findMany: async () => this.data.partners,
    create: async ({ data }: { data: Omit<Partner, "id"> }) => {
      const newPartner = { id: `part_${Date.now()}`, ...data };
      this.data.partners.push(newPartner);
      this.saveData();
      return newPartner;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Partner> }) => {
      const idx = this.data.partners.findIndex(p => p.id === where.id);
      if (idx === -1) throw new Error("Partner not found");
      this.data.partners[idx] = { ...this.data.partners[idx], ...data };
      this.saveData();
      return this.data.partners[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.partners.find(p => p.id === where.id);
      this.data.partners = this.data.partners.filter(p => p.id !== where.id);
      this.saveData();
      return deleted;
    }
  };

  // OFFICIALS
  public officials = {
    findMany: async () => [...this.data.officials].sort((a, b) => a.order - b.order),
    create: async ({ data }: { data: Omit<Official, "id"> }) => {
      const item = { id: `off_${Date.now()}`, ...data };
      this.data.officials.push(item);
      this.saveData();
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Official> }) => {
      const idx = this.data.officials.findIndex(o => o.id === where.id);
      if (idx === -1) throw new Error("Official not found");
      this.data.officials[idx] = { ...this.data.officials[idx], ...data };
      this.saveData();
      return this.data.officials[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.officials.find(o => o.id === where.id);
      this.data.officials = this.data.officials.filter(o => o.id !== where.id);
      this.saveData();
      return deleted;
    },
  };

  // SPEECHES
  public speeches = {
    findMany: async () => [...this.data.speeches].sort((a, b) => a.order - b.order),
    create: async ({ data }: { data: Omit<Speech, "id"> }) => {
      const item = { id: `sp_${Date.now()}`, ...data };
      this.data.speeches.push(item);
      this.saveData();
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Speech> }) => {
      const idx = this.data.speeches.findIndex(s => s.id === where.id);
      if (idx === -1) throw new Error("Speech not found");
      this.data.speeches[idx] = { ...this.data.speeches[idx], ...data };
      this.saveData();
      return this.data.speeches[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.speeches.find(s => s.id === where.id);
      this.data.speeches = this.data.speeches.filter(s => s.id !== where.id);
      this.saveData();
      return deleted;
    },
  };

  // EVENTS
  public events = {
    findMany: async () => this.data.events,
    create: async ({ data }: { data: Omit<AppEvent, "id"> }) => {
      const item = { id: `ev_${Date.now()}`, ...data };
      this.data.events.push(item);
      this.saveData();
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<AppEvent> }) => {
      const idx = this.data.events.findIndex(e => e.id === where.id);
      if (idx === -1) throw new Error("Event not found");
      this.data.events[idx] = { ...this.data.events[idx], ...data };
      this.saveData();
      return this.data.events[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.events.find(e => e.id === where.id);
      this.data.events = this.data.events.filter(e => e.id !== where.id);
      this.saveData();
      return deleted;
    },
  };

  // GALLERY
  public gallery = {
    findMany: async () => [...this.data.gallery].sort((a, b) => a.order - b.order),
    create: async ({ data }: { data: Omit<GalleryItem, "id" | "createdAt" | "order"> & { order?: number } }) => {
      const item: GalleryItem = {
        id: `gal_${Date.now()}`,
        createdAt: new Date().toISOString(),
        order: data.order ?? this.data.gallery.length,
        ...data,
      };
      this.data.gallery.push(item);
      this.saveData();
      return item;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<GalleryItem> }) => {
      const idx = this.data.gallery.findIndex(g => g.id === where.id);
      if (idx === -1) throw new Error("Gallery item not found");
      this.data.gallery[idx] = { ...this.data.gallery[idx], ...data };
      this.saveData();
      return this.data.gallery[idx];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.gallery.find(g => g.id === where.id);
      this.data.gallery = this.data.gallery.filter(g => g.id !== where.id);
      this.saveData();
      return deleted;
    }
  };
}

// Instantiate Database Engine depending on configuration
export const db = isPgConfigured ? prismaClient : new JsonDbEngine();
export const usingMockDb = !isPgConfigured;
export const BupatiSpeechData = {
  name: "M. Dawam Rahardjo",
  title: "Bupati Lampung Timur",
  photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  welcomeSpeech: "Tabik Pun! Selamat datang di Portal Wisata resmi Kabupaten Lampung Timur. Kami mengundang seluruh wisatawan untuk datang dan menyaksikan sendiri kekayaan alam liar yang mempesona di Taman Nasional Way Kambas, keindahan bahari pantai pesisir timur, serta peninggalan prasejarah yang bernilai tinggi. Lampung Timur terus berinovasi dalam memajukan pemuda, olahraga, dan industri ekonomi kreatif lokal demi mewujudkan masyarakat yang sejahtera dan berbudaya."
};
