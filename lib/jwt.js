// lib/jwt.js
// Session tokens using jose (works in both the Edge middleware runtime and
// normal Node API routes) so login state survives across serverless
// invocations — unlike express-session's in-memory store, which doesn't
// work once your app is spread across many short-lived functions.

import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "familymovie_session";

const JWT_SECRET = "familymovie-9f3a1c7e2b6d4f8091a5c3e7b2d6f0a4c8e1b5d9f3a7c0e4b8d2f6a0c4e8b1d5";

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
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
