// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { createSessionToken, COOKIE_NAME } from "@/lib/jwt";

export async function POST(request) {
  const { username, password, confirmPassword } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Lengkapi semua kolom." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Konfirmasi password tidak cocok." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
  }

  let user;
  try {
    user = await createUser({ username: username.trim(), password, role: "member" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const token = await createSessionToken({ id: user.id, username: user.username, role: user.role });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
