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
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

interface JsonDatabaseSchema {
  users: User[];
  destinations: Destination[];
  posts: Post[];
  partners: Partner[];
}

// Check if we have PostgreSQL configured
const isPgConfigured = !!process.env.DATABASE_URL;

let prismaClient: any;
if (isPgConfigured) {
  prismaClient = new PrismaClient();
}

// ----------------------------------------------------
// Fallback Mock JSON Database Engine
// ----------------------------------------------------
class JsonDbEngine {
  private data: JsonDatabaseSchema = { users: [], destinations: [], posts: [], partners: [] };

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
        imageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=800&q=80",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: "published",
        tags: "Festival, Way Kambas, Konservasi, Wisata Alam"
      },
      {
        id: "post_2",
        title: "Pantai Kerang Mas Alami Lonjakan Pengunjung Sepanjang Libur Lebaran",
        slug: "pantai-kerang-mas-alami-lonjakan-pengunjung-sepanjang-libur-lebaran",
        content: "Destinasi wisata bahari andalan Lampung Timur, Pantai Kerang Mas, mencatat rekor kunjungan wisatawan tertinggi selama liburan pekan ini. Ribuan wisatawan lokal dan luar daerah memadati pantai untuk menikmati gazebo pesisir, kuliner tangkapan laut segar, penyewaan ban, serta wahana ATV. Pokdarwis setempat menyatakan kesiapan keamanan pantai telah dioptimalkan guna mengantisipasi ramainya pelancong.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: "published",
        tags: "Pantai, Kerang Mas, Wisata Alam, Lebaran"
      },
      {
        id: "post_3",
        title: "Pembinaan & Sertifikasi Pemandu Wisata Desa Wisata Lampung Timur",
        slug: "pembinaan-sertifikasi-pemandu-wisata-desa-wisata-lampung-timur",
        content: "Dalam rangka meningkatkan mutu layanan hospitality, Bidang Pengembangan Destinasi Dinas Pariwisata Lampung Timur menyelenggarakan pembinaan intensif dan sertifikasi bagi 40 pemandu desa wisata. Program ini melibatkan desa wisata binaan seperti Braja Harjosari dan Desa Tradisional Wana. Pemandu dibekali keahlian story-telling adat, keselamatan pelancong, serta pemanfaatan media promosi.",
        imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
        authorId: "usr_admindinas",
        authorName: "Admin Bidang Dinas",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        status: "published",
        tags: "Pelatihan, Pemandu, Desa Wisata, Sertifikasi"
      },
      {
        id: "post_4",
        title: "Ekspor Kerajinan Tapis Lampung Timur Tumbuh Pesat Didorong Pasar Digital",
        slug: "ekspor-tapis-lampung-timur-tumbuh-pesat",
        content: "Kerajinan kain tapis khas Lampung Timur mengalami lonjakan permintaan ekspor luar negeri sepanjang triwulan pertama tahun ini, didukung program Go Digital dari Dinas Pariwisata dan Ekonomi Kreatif.",
        imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80",
        authorId: "usr_adminpost",
        authorName: "Editor Berita Dinas",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        status: "published",
        tags: "Kriya, Tapis, Ekonomi Kreatif, Ekspor"
      }
    ];

    // 4. Seed Partner Logos
    const seedPartners: Partner[] = [
      { id: "part_1", name: "Kemenparekraf RI", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
      { id: "part_2", name: "Taman Nasional Way Kambas", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
      { id: "part_3", name: "Bank Lampung", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
      { id: "part_4", name: "Pokdarwis Lampung Timur", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" },
      { id: "part_5", name: "Pemerintah Provinsi Lampung", logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=150&q=80" }
    ];

    this.data = {
      users: seedUsers,
      destinations: seedDestinations,
      posts: seedPosts,
      partners: seedPartners
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
    delete: async ({ where }: { where: { id: string } }) => {
      const deleted = this.data.partners.find(p => p.id === where.id);
      this.data.partners = this.data.partners.filter(p => p.id !== where.id);
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
