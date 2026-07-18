// app/api/upload/thumbnail/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";

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
  });

  return NextResponse.json(blob);
}
