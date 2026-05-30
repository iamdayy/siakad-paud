import {
  canAccessPath,
  PROTECTED_ROUTE_RULES,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  );
}

function findProtectedRule(pathname: string) {
  return PROTECTED_ROUTE_RULES.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  if (pathname === "/login" && payload) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const protectedRule = findProtectedRule(pathname);
  if (!protectedRule) {
    return NextResponse.next();
  }

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessPath(payload.role, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
