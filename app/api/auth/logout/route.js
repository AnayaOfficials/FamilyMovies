// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
