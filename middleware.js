// middleware.js
import { NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "./lib/jwt";

const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Let Next.js internals, static assets, and auth API routes through.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/api/movies") && request.method !== "GET" && session?.role !== "admin") {
    return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  }

  if (pathname.startsWith("/api/upload") && session?.role !== "admin") {
    return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/admin/:path*",
    "/watch/:path*",
    "/api/movies/:path*",
    "/api/upload/:path*",
  ],
};
