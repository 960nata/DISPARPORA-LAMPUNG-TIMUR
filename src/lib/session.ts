import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.SIMAD_SESSION_SECRET ?? "simad-dev-secret-GANTI-DI-PRODUKSI";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

export function signSession(userId: string, role: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}|${role}|${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySession(token: string): { id: string; role: string } | null {
  const parts = token.split("|");
  if (parts.length !== 4) return null;
  const [userId, role, expStr, sig] = parts;
  const payload = `${userId}|${role}|${expStr}`;
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  if (Date.now() > Number(expStr)) return null;
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

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: TTL_MS / 1000,
};
