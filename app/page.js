// app/watch/[id]/page.js
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { findMovieById } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const movie = await findMovieById(id);

  if (!movie) notFound();

  return (
    <>
      <Nav currentUser={currentUser} />
      <main className="container watch-shell">
        <a href="/" className="back-link">&larr; Kembali ke daftar film</a>

        <div className="player-frame">
          <video
            controls
            autoPlay
            preload="metadata"
            poster={movie.thumbnailUrl || undefined}
          >
            <source src={movie.videoUrl} type={movie.mimeType || "video/mp4"} />
            Browser kamu tidak mendukung pemutaran video HTML5.
          </video>
        </div>

        {movie.genre && <div className="watch-meta">{movie.genre}</div>}
        <h1 className="watch-title">{movie.title}</h1>
        {movie.description && <p className="watch-desc">{movie.description}</p>}
      </main>
      <footer className="site-footer">FamilyMovie · koleksi pribadi keluarga</footer>
    </>
  );
}
