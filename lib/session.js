// lib/session.js
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return { id: session.id, username: session.username, role: session.role };
}
