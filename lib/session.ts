import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "siakad_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

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
      roles: ["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"], // Parents have their own portal
    },
    { path: "/parent", roles: ["ORANG_TUA"] },
    { path: "/ppdb", roles: ["ADMIN", "TU"] },
    { path: "/siswa", roles: ["ADMIN", "TU"] },
    { path: "/kelas", roles: ["ADMIN", "TU", "KEPALA_SEKOLAH"] },
    { path: "/presensi", roles: ["ADMIN", "TU", "GURU"] },
    { path: "/keuangan", roles: ["ADMIN", "TU"] },
    { path: "/laporan/lesson-plan", roles: ["ADMIN", "TU", "KEPALA_SEKOLAH"] },
    { path: "/laporan", roles: ["ADMIN", "TU", "GURU", "KEPALA_SEKOLAH"] },
    { path: "/guru", roles: ["ADMIN", "TU"] },
    { path: "/orangtua", roles: ["ADMIN", "TU", "KEPALA_SEKOLAH"] },
    { path: "/admin/pengaturan", roles: ["ADMIN", "KEPALA_SEKOLAH"] },
  ];

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "siakad-paud-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: {
  userId: string;
  role: AppRole;
  expiresAt: number;
}) {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt / 1000)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (!payload.userId || !payload.role) return null;
    if (!APP_ROLES.includes(payload.role as AppRole)) return null;

    return {
      userId: payload.userId as string,
      role: payload.role as AppRole,
      expiresAt: (payload.exp as number) * 1000,
    };
  } catch (error) {
    return null;
  }
}

export function sanitizeNextPath(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!value) return fallback;
  return value.startsWith("/") ? value : fallback;
}

export function canAccessPath(role: AppRole, pathname: string) {
  // Sort rules by path length descending so more specific paths match first
  const sortedRules = [...PROTECTED_ROUTE_RULES].sort((a, b) => b.path.length - a.path.length);
  
  const matchedRule = sortedRules.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`)
  );

  if (matchedRule) {
    return matchedRule.roles.includes(role);
  }
  
  return false;
}

export function getAllowedRoutes(role: AppRole) {
  return PROTECTED_ROUTE_RULES.filter((rule) =>
    rule.roles.includes(role),
  );
}
