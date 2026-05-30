import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "siakad_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const APP_ROLES = [
  "ADMIN",
  "TU",
  "GURU",
  "KEPALA_SEKOLAH",
  "ORANG_TUA",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const PROTECTED_ROUTE_RULES: Array<{
  path: string;
  roles: readonly AppRole[];
}> = [
  {
    path: "/dashboard",
    roles: ["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH", "ORANG_TUA"],
  },
  { path: "/ppdb", roles: ["ADMIN", "TU"] },
  { path: "/siswa", roles: ["ADMIN", "TU"] },
  { path: "/presensi", roles: ["ADMIN", "TU", "GURU"] },
  { path: "/keuangan", roles: ["ADMIN", "TU"] },
  { path: "/laporan", roles: ["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"] },
  { path: "/guru", roles: ["ADMIN", "TU"] },
  { path: "/orangtua", roles: ["ADMIN", "TU", "KEPALA_SEKOLAH"] },
];

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET ?? "siakad-paud-dev-secret-change-me";
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  array.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return toBase64Url(signature);
}

export async function createSessionToken(payload: {
  userId: string;
  role: AppRole;
  expiresAt: number;
}) {
  const body = `${payload.userId}.${payload.role}.${payload.expiresAt}`;
  const signature = await signPayload(body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [userId, role, expiresAtString, signature] = token.split(".");
  if (!userId || !role || !expiresAtString || !signature) return null;
  if (!APP_ROLES.includes(role as AppRole)) return null;

  const expiresAt = Number(expiresAtString);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  const body = `${userId}.${role}.${expiresAt}`;
  const expected = await signPayload(body);
  const signatureBytes = fromBase64Url(signature);
  const expectedBytes = fromBase64Url(expected);
  if (signatureBytes.length !== expectedBytes.length) return null;

  const actual = await crypto.subtle.verify(
    "HMAC",
    await getSigningKey(),
    signatureBytes,
    encoder.encode(body),
  );

  return actual
    ? {
        userId,
        role: role as AppRole,
        expiresAt,
      }
    : null;
}

export function sanitizeNextPath(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!value) return fallback;
  return value.startsWith("/") ? value : fallback;
}

export function canAccessPath(role: Role | AppRole, pathname: string) {
  return PROTECTED_ROUTE_RULES.some(
    (rule) =>
      (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) &&
      rule.roles.includes(role as AppRole),
  );
}

export function getAllowedRoutes(role: Role | AppRole) {
  return PROTECTED_ROUTE_RULES.filter((rule) =>
    rule.roles.includes(role as AppRole),
  );
}
