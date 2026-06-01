import { canAccessPath, SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/ppdb-public") ||
    pathname.startsWith("/api/ppdb/submit") ||
    pathname.startsWith("/api/ppdb/upload-url") ||
    pathname.startsWith("/midtrans/success") ||
    pathname.startsWith("/midtrans/failure") ||
    pathname.startsWith("/midtrans/error") ||
    pathname.startsWith("/api/midtrans/webhook")
  ) {
    return NextResponse.next();
  }

  // Protect all other routes
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Authorization Check
  // We extract the base path (e.g., /dashboard, /parent)
  const basePath = `/${pathname.split("/")[1]}`;

  // Specific checks based on root paths
  if (!pathname.startsWith("/api")) {
    if (basePath === "/portal" && payload.role !== "ORANG_TUA") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (basePath !== "/portal" && payload.role === "ORANG_TUA") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with common image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
