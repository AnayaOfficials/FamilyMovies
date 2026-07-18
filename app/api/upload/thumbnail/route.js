// app/api/upload/thumbnail/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";

const BLOB_TOKEN = "vercel_blob_rw_K4GLVfEM16jdfLfG_bMRHipNhlssOXsR8c8kCjEgG9tO0n0";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || `thumb-${Date.now()}.jpg`;

  const blob = await put(`thumbnails/${filename}`, request.body, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
    token: BLOB_TOKEN,
  });

  return NextResponse.json(blob);
}
