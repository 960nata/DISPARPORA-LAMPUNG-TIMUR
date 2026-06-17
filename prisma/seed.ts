/**
 * Seed script — migrates all data from db_store.json to Supabase via Prisma.
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const DB_PATH = path.join(process.cwd(), "src/data/db_store.json");

interface RawData {
  users: any[];
  destinations: any[];
  posts: any[];
  partners: any[];
  gallery: any[];
  officials: any[];
  speeches: any[];
  events: any[];
}

async function main() {
  console.log("📦 Membaca db_store.json...");
  const raw: RawData = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

  // ─── 1. USERS ────────────────────────────────────────────────
  console.log(`👤 Seeding ${raw.users.length} users...`);
  await prisma.user.deleteMany();
  for (const u of raw.users) {
    await prisma.user.create({
      data: {
        id:          u.id,
        username:    u.username,
        password:    u.password ?? "",
        name:        u.name,
        role:        u.role,
        permissions: u.permissions ?? null,
      },
    });
  }
  console.log("   ✅ Users selesai");

  // ─── 2. DESTINATIONS ─────────────────────────────────────────
  console.log(`📍 Seeding ${raw.destinations.length} destinations...`);
  await prisma.destination.deleteMany();
  for (const d of raw.destinations) {
    await prisma.destination.create({
      data: {
        id:             d.id,
        name:           d.name,
        category:       d.category,
        kecamatan:      d.kecamatan,
        address:        d.address     ?? null,
        lat:            Number(d.lat),
        lng:            Number(d.lng),
        active:         d.active      ?? true,
        facilities:     d.facilities  ?? null,
        contact:        d.contact     ?? null,
        map_link:       d.map_link    ?? null,
        classification: d.classification ?? null,
        rooms:          d.rooms       ? Number(d.rooms)    : null,
        food_type:      d.food_type   ?? null,
        capacity:       d.capacity    ? Number(d.capacity) : null,
        imageUrl:       d.imageUrl    ?? null,
        description:    d.description ?? null,
        slug:           d.slug        ?? null,
        gallery:        Array.isArray(d.gallery) ? d.gallery : null,
      },
    });
  }
  console.log("   ✅ Destinations selesai");

  // ─── 3. POSTS ────────────────────────────────────────────────
  console.log(`📰 Seeding ${raw.posts.length} posts...`);
  await prisma.post.deleteMany();
  for (const p of raw.posts) {
    // Pastikan authorId ada di users
    const authorExists = raw.users.find((u: any) => u.id === p.authorId);
    await prisma.post.create({
      data: {
        id:          p.id,
        title:       p.title,
        slug:        p.slug,
        content:     p.content,
        imageUrl:    p.imageUrl,
        authorId:    authorExists ? p.authorId : raw.users[0].id,
        authorName:  p.authorName  ?? null,
        createdAt:   new Date(p.createdAt),
        status:      p.status,
        tags:        p.tags        ?? null,
        seoTitle:    p.seoTitle    ?? null,
        seoDesc:     p.seoDesc     ?? null,
        publishDate: p.publishDate ?? null,
      },
    });
  }
  console.log("   ✅ Posts selesai");

  // ─── 4. PARTNERS ─────────────────────────────────────────────
  console.log(`🤝 Seeding ${raw.partners.length} partners...`);
  await prisma.partner.deleteMany();
  for (const p of raw.partners) {
    await prisma.partner.create({
      data: { id: p.id, name: p.name, logoUrl: p.logoUrl },
    });
  }
  console.log("   ✅ Partners selesai");

  // ─── 5. GALLERY ──────────────────────────────────────────────
  console.log(`🖼️  Seeding ${raw.gallery.length} gallery items...`);
  await prisma.galleryItem.deleteMany();
  for (const g of raw.gallery) {
    await prisma.galleryItem.create({
      data: {
        id:        g.id,
        title:     g.title,
        category:  g.category,
        imageUrl:  g.imageUrl,
        order:     g.order    ?? 0,
        createdAt: new Date(g.createdAt),
      },
    });
  }
  console.log("   ✅ Gallery selesai");

  // ─── 6. OFFICIALS ────────────────────────────────────────────
  console.log(`🏛️  Seeding ${raw.officials.length} officials...`);
  await prisma.official.deleteMany();
  for (const o of raw.officials) {
    await prisma.official.create({
      data: {
        id:       o.id,
        name:     o.name,
        title:    o.title,
        role:     o.role,
        photoUrl: o.photoUrl ?? null,
        order:    o.order    ?? 0,
      },
    });
  }
  console.log("   ✅ Officials selesai");

  // ─── 7. SPEECHES ─────────────────────────────────────────────
  console.log(`🎤 Seeding ${raw.speeches.length} speeches...`);
  await prisma.speech.deleteMany();
  for (const s of raw.speeches) {
    await prisma.speech.create({
      data: {
        id:            s.id,
        name:          s.name,
        title:         s.title,
        badge:         s.badge,
        photoUrl:      s.photoUrl,
        welcomeSpeech: s.welcomeSpeech,
        order:         s.order ?? 0,
      },
    });
  }
  console.log("   ✅ Speeches selesai");

  // ─── 8. EVENTS ───────────────────────────────────────────────
  console.log(`📅 Seeding ${raw.events.length} events...`);
  await prisma.appEvent.deleteMany();
  for (const e of raw.events) {
    await prisma.appEvent.create({
      data: {
        id:       e.id,
        title:    e.title,
        date:     e.date,
        location: e.location,
        desc:     e.desc,
        status:   e.status,
        image:    e.image ?? null,
      },
    });
  }
  console.log("   ✅ Events selesai");

  // ─── SUMMARY ─────────────────────────────────────────────────
  console.log("\n🎉 Seed selesai! Semua data berhasil dipindahkan ke Supabase.");
  console.log("─".repeat(50));
  console.log(`   Users:        ${raw.users.length}`);
  console.log(`   Destinations: ${raw.destinations.length}`);
  console.log(`   Posts:        ${raw.posts.length}`);
  console.log(`   Partners:     ${raw.partners.length}`);
  console.log(`   Gallery:      ${raw.gallery.length}`);
  console.log(`   Officials:    ${raw.officials.length}`);
  console.log(`   Speeches:     ${raw.speeches.length}`);
  console.log(`   Events:       ${raw.events.length}`);
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
