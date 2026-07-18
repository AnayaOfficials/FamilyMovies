// app/api/movies/route.js
import { NextResponse } from "next/server";
import { createMovie } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  }

  const { title, description, genre, videoUrl, videoPathname, mimeType, thumbnailUrl, thumbnailPathname } =
    await request.json();

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Judul film wajib diisi." }, { status: 400 });
  }
  if (!videoUrl || !videoPathname) {
    return NextResponse.json({ error: "Video belum berhasil diupload." }, { status: 400 });
  }

  const movie = await createMovie({
    title: title.trim(),
    description: (description || "").trim(),
    genre: (genre || "").trim(),
    videoUrl,
    videoPathname,
    mimeType: mimeType || "video/mp4",
    thumbnailUrl: thumbnailUrl || null,
    thumbnailPathname: thumbnailPathname || null,
    uploadedBy: user.username,
  });

  return NextResponse.json(movie);
}
