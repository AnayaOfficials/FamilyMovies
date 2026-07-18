// lib/db.js
// Data layer backed by Upstash Redis. We can't write to a local db.json
// file anymore — every request may land on a different, short-lived
// serverless instance with its own throwaway filesystem — so state has
// to live in a real network-accessible store instead.
//
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, which
// Vercel injects automatically once you connect an Upstash Redis
// integration from the Marketplace.

import { Redis } from "@upstash/redis";
import { hashPassword } from "./password";

const redis = Redis.fromEnv();

// --- users ---
// Stored as a Redis hash: field = lowercase username, value = JSON string.
export async function findUserByUsername(username) {
  if (!username) return null;
  const raw = await redis.hget("users:data", username.toLowerCase());
  return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
}

export async function createUser({ username, password, role }) {
  const key = username.toLowerCase();
  const existing = await redis.hget("users:data", key);
  if (existing) {
    throw new Error("Username sudah dipakai.");
  }
  const id = await redis.incr("users:count");
  const user = {
    id,
    username,
    passwordHash: hashPassword(password),
    role, // 'admin' | 'member'
    createdAt: new Date().toISOString(),
  };
  await redis.hset("users:data", { [key]: JSON.stringify(user) });
  return user;
}

export async function ensureSeedAdmin() {
  const existing = await redis.hget("users:data", "admin");
  if (existing) return;
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  await createUser({ username, password, role: "admin" });
}

// --- movies ---
// movies:data  -> hash, field = id, value = JSON string
// movies:order -> sorted set, score = id, member = id (lets us list newest-first)
export async function listMovies() {
  const ids = await redis.zrange("movies:order", 0, -1, { rev: true });
  if (!ids || ids.length === 0) return [];
  const raws = await redis.hmget("movies:data", ...ids.map(String));
  return ids
    .map((id) => raws[id])
    .filter(Boolean)
    .map((raw) => (typeof raw === "string" ? JSON.parse(raw) : raw));
}

export async function findMovieById(id) {
  const raw = await redis.hget("movies:data", String(id));
  return raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
}

export async function createMovie(movie) {
  const id = await redis.incr("movies:count");
  const record = {
    id,
    createdAt: new Date().toISOString(),
    ...movie,
  };
  await redis.hset("movies:data", { [String(id)]: JSON.stringify(record) });
  await redis.zadd("movies:order", { score: id, member: String(id) });
  return record;
}

export async function deleteMovie(id) {
  const movie = await findMovieById(id);
  await redis.hdel("movies:data", String(id));
  await redis.zrem("movies:order", String(id));
  return movie;
}
