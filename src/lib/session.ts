import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.SIMAD_SESSION_SECRET ?? "";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

// Panic hard at startup if secret is missing or weak in production
if (!SECRET || SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[SECURITY] SIMAD_SESSION_SECRET must be set and at least 32 characters long in production. " +
        "Generate one with: openssl rand -hex 32"
    );
  }
  // Dev fallback — intentionally verbose warning
  console.warn(
    "\x1b[33m[SECURITY WARNING]\x1b[0m SIMAD_SESSION_SECRET is not set or too short. " +
      "Using an insecure dev secret. Set a proper secret before deploying to production."
  );
}

// Use a runtime-safe secret that is never empty
const RUNTIME_SECRET =
  SECRET.length >= 32 ? SECRET : "simad-dev-secret-DO-NOT-USE-IN-PRODUCTION-xxxx";

export function signSession(userId: string, role: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}|${role}|${exp}`;
  const sig = createHmac("sha256", RUNTIME_SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySession(token: string): { id: string; role: string } | null {
  const parts = token.split("|");
  if (parts.length !== 4) return null;
  const [userId, role, expStr, sig] = parts;
  const payload = `${userId}|${role}|${expStr}`;
  const expected = createHmac("sha256", RUNTIME_SECRET).update(payload).digest("hex");
  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    // Lengths must match for timingSafeEqual
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }
  if (Date.now() > Number(expStr)) return null;
  // Validate role is one of the known roles
  if (!["superadmin", "admin_dinas", "admin_post"].includes(role)) return null;
  return { id: userId, role };
}

export function requireAuth(request: NextRequest): { id: string; role: string } | NextResponse {
  const cookie = request.cookies.get("simad_auth");
  if (!cookie) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const user = verifySession(cookie.value);
  if (!user) return NextResponse.json({ error: "Sesi tidak valid atau sudah kedaluwarsa" }, { status: 401 });
  return user;
}

export function requireSuperadmin(request: NextRequest): { id: string; role: string } | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat mengakses fitur ini" }, { status: 403 });
  }
  return result;
}

/** Require admin_dinas or superadmin */
export function requireAdminDinas(request: NextRequest): { id: string; role: string } | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (!["superadmin", "admin_dinas"].includes(result.role)) {
    return NextResponse.json({ error: "Akses ditolak. Diperlukan role Admin Dinas atau Super Admin." }, { status: 403 });
  }
  return result;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TTL_MS / 1000,
};
