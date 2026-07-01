import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, jsonDb, findUserByLogin } from "@/lib/db";
import { signSession, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rateLimit";

const BCRYPT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  // ── Rate limiting: keyed by IP ──────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateResult = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateResult.retryAfterSeconds} detik.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.retryAfterSeconds),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Basic input length guard
    if (email.length > 254 || password.length > 128) {
      return NextResponse.json(
        { error: "Email atau password tidak valid" },
        { status: 400 }
      );
    }

    // Look up by email OR username (the `email` field isn't on the Prisma
    // model, so this uses a raw-SQL helper — see findUserByLogin).
    let user: any = null;
    try {
      user = await findUserByLogin(email);
    } catch {
      user = await jsonDb.users.findUnique({ where: { username: email } });
    }

    if (!user) {
      // Constant-time-ish delay even when user not found to prevent enumeration
      await bcrypt.hash("dummy-prevent-timing-attack", 1);
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // ── Password verification with grace period ────────────
    // If stored password starts with "$2" it's already a bcrypt hash.
    // Otherwise it's a legacy plaintext password → verify then upgrade.
    let passwordValid = false;
    const storedPassword: string = user.password ?? "";

    if (storedPassword.startsWith("$2")) {
      // bcrypt hash
      passwordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Legacy plaintext — direct compare (constant-time via bcrypt.compare on hash)
      passwordValid = storedPassword === password;
      if (passwordValid) {
        // Auto-upgrade to bcrypt hash silently
        const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        try {
          await db.users.update({ where: { id: user.id }, data: { password: newHash } });
        } catch {
          try { await jsonDb.users.update({ where: { id: user.id }, data: { password: newHash } }); } catch {}
        }
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = signSession(user.id, user.role);

    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set("simad_auth", token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
