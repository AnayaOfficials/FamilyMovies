// app/page.js
import Nav from "@/components/Nav";
import { listMovies } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic"; // always show the latest uploads

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const movies = await listMovies();

  return (
    <>
      <Nav currentUser={currentUser} />
      <main className="container">
        <section className="hero">
          <div className="hero-eyebrow">Bioskop keluarga, di rumah sendiri</div>
          <h1>Malam ini nonton apa?</h1>
          <p>Koleksi film yang diupload keluarga, siap ditonton kapan saja, dari mana saja.</p>
        </section>

        {movies.length === 0 ? (
          <div className="empty-state">
            <h2>Belum ada film</h2>
            <p>Minta admin upload film pertama lewat Panel Admin.</p>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <a href={`/watch/${movie.id}`} className="ticket-link" key={movie.id}>
                <article className="ticket">
                  {movie.thumbnailUrl ? (
                    <img className="ticket-poster" src={movie.thumbnailUrl} alt={`Thumbnail ${movie.title}`} />
                  ) : (
                    <div className="ticket-poster placeholder">{movie.title}</div>
                  )}
                  <div className="ticket-body">
                    {movie.genre && <div className="ticket-meta">{movie.genre}</div>}
                    <h3 className="ticket-title">{movie.title}</h3>
                    {movie.description && <p className="ticket-desc">{movie.description}</p>}
                  </div>
                </article>
              </a>
            ))}
          </div>
        )}
      </main>
      <footer className="site-footer">FamilyMovie · koleksi pribadi keluarga</footer>
    </>
  );
}
