import "server-only";

import { prisma } from "@/lib/prisma";
import {
  AppRole,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  sanitizeNextPath,
  verifySessionToken,
} from "@/lib/session";
import type { User } from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function hashPassword(password: string) {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive || user.role !== payload.role) {
    return null;
  }

  return user;
}

export async function requirePageAccess(
  route: string,
  allowedRoles: readonly AppRole[],
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(route)}`);
  }

  if (!allowedRoles.includes(user.role as AppRole)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireActionAccess(allowedRoles: readonly AppRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role as AppRole)) redirect("/unauthorized");
  return user;
}

export async function buildSessionCookie(user: Pick<User, "id" | "role">) {
  return createSessionToken({
    userId: user.id,
    role: user.role as AppRole,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getNextPath(formValue: FormDataEntryValue | null) {
  const next = typeof formValue === "string" ? formValue : null;
  return sanitizeNextPath(next);
}
