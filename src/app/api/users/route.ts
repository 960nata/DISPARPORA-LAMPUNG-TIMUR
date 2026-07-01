import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, jsonDb } from "@/lib/db";
import { requireSuperadmin } from "@/lib/session";

const BCRYPT_ROUNDS = 12;
const VALID_ROLES = ["superadmin", "admin_dinas", "admin_post"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

async function findMany() {
  try { return await db.users.findMany(); }
  catch { return await jsonDb.users.findMany(); }
}

async function findUnique(where: { username?: string; id?: string }) {
  try { return await db.users.findUnique({ where }); }
  catch { return await jsonDb.users.findUnique({ where }); }
}

async function create(data: any) {
  try { return await db.users.create({ data }); }
  catch { return await jsonDb.users.create({ data }); }
}

export async function GET(request: NextRequest) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const list = await findMany();
    const safeList = list.map(({ password: _, ...rest }: any) => rest);
    return NextResponse.json(safeList);
  } catch (e: any) {
    return NextResponse.json({ error: "Gagal memuat daftar pengguna." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireSuperadmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();

    // ── Input validation ────────────────────────────────
    const username = String(data.username || "").trim();
    const password = String(data.password || "");
    const name = String(data.name || "").trim();
    const role = String(data.role || "");

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: "Username, password, name, dan role wajib diisi." },
        { status: 400 }
      );
    }

    // Role must be one of the allowed values
    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: `Role tidak valid. Gunakan salah satu dari: ${VALID_ROLES.join(", ")}.` },
        { status: 400 }
      );
    }

    // Length guards
    if (username.length > 60) return NextResponse.json({ error: "Username terlalu panjang (maks. 60 karakter)." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Password harus antara 8–128 karakter." }, { status: 400 });
    if (name.length > 120) return NextResponse.json({ error: "Nama terlalu panjang (maks. 120 karakter)." }, { status: 400 });

    const existing = await findUnique({ username });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan." }, { status: 409 });
    }

    // ── Hash password ───────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = await create({
      username,
      password: hashedPassword,
      name,
      role,
      ...(data.email ? { email: String(data.email).trim().toLowerCase() } : {}),
      ...(data.permissions !== undefined
        ? {
            permissions:
              typeof data.permissions === "string"
                ? data.permissions
                : JSON.stringify(data.permissions),
          }
        : {}),
    });

    const { password: _, ...safeUser } = newUser as any;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
