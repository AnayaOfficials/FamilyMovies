// lib/jwt.js
// Session tokens using jose (works in both the Edge middleware runtime and
// normal Node API routes) so login state survives across serverless
// invocations — unlike express-session's in-memory store, which doesn't
// work once your app is spread across many short-lived functions.

import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "familymovie_session";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET belum diset. Tambahkan environment variable JWT_SECRET di Vercel (string acak, minimal 32 karakter)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken({ id, username, role }) {
  return await new SignJWT({ id, username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload; // { id, username, role, iat, exp }
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
