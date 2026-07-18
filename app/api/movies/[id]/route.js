// app/api/movies/[id]/route.js
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteMovie } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Khusus admin." }, { status: 403 });
  }

  const { id } = await params;
  const movie = await deleteMovie(id);

  if (movie) {
    const toDelete = [movie.videoUrl, movie.thumbnailUrl].filter(Boolean);
    if (toDelete.length > 0) {
      try {
        await del(toDelete);
      } catch {
        // Metadata is already gone; a leftover blob just wastes a little
        // storage and isn't linked from anywhere in the app anymore.
      }
    }
  }

  return NextResponse.json({ ok: true });
}
