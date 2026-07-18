// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { findUserByUsername, ensureSeedAdmin } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, COOKIE_NAME } from "@/lib/jwt";

export async function POST(request) {
  await ensureSeedAdmin();

  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Lengkapi username dan password." }, { status: 400 });
  }

  const user = await findUserByUsername(username.trim());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, username: user.username, role: user.role });

  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
