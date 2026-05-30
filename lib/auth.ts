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
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type DemoUserSeed = {
  username: string;
  password: string;
  displayName: string;
  role: AppRole;
};

const demoUsers: DemoUserSeed[] = [
  {
    username: "admin",
    password: "admin123",
    displayName: "Admin Sekolah",
    role: "ADMIN",
  },
  { username: "tu", password: "tu123", displayName: "Tata Usaha", role: "TU" },
  {
    username: "guru",
    password: "guru123",
    displayName: "Guru Kelas",
    role: "GURU",
  },
  {
    username: "kepsek",
    password: "kepsek123",
    displayName: "Kepala Sekolah",
    role: "KEPALA_SEKOLAH",
  },
  {
    username: "orangtua",
    password: "ortu123",
    displayName: "Orang Tua",
    role: "ORANG_TUA",
  },
];

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString("hex");
}

function createPasswordRecord(password: string) {
  const salt = randomBytes(16).toString("hex");
  return {
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  };
}

async function ensureDemoUsers() {
  const existingCount = await prisma.user.count();
  if (existingCount > 0) return;

  await prisma.user.createMany({
    data: demoUsers.map((demoUser) => ({
      username: demoUser.username,
      displayName: demoUser.displayName,
      role: demoUser.role,
      ...createPasswordRecord(demoUser.password),
    })),
  });
}

function verifyPassword(password: string, salt: string, passwordHash: string) {
  const derived = scryptSync(password, salt, 32);
  return timingSafeEqual(derived, Buffer.from(passwordHash, "hex"));
}

export async function authenticateUser(username: string, password: string) {
  await ensureDemoUsers();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) return null;
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash))
    return null;

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
