import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

const COOKIE = "lumiere_session";

export type Session = { kind: "customer" | "admin"; refId: string };

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
  if (!rows.length) return null;
  const kind = rows[0].kind === "admin" ? "admin" : "customer";
  return { kind, refId: rows[0].refId } satisfies Session;
}

export async function createSession(kind: "customer" | "admin", refId: string) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await db
    .insert(sessions)
    .values({ token, kind, refId, expiresAt })
    .catch(() => null);
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 3600,
  });
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => null);
  }
  c.delete(COOKIE);
}

export function normalizeUsername(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}
