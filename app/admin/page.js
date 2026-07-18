// app/admin/page.js
import Nav from "@/components/Nav";
import UploadForm from "@/components/UploadForm";
import DeleteMovieButton from "@/components/DeleteMovieButton";
import { listMovies } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  const movies = await listMovies();

  return (
    <>
      <Nav currentUser={currentUser} />
      <main className="container">
        <section className="hero" style={{ paddingBottom: 0 }}>
          <div className="hero-eyebrow">Panel admin</div>
          <h1>Upload film baru</h1>
          <p>Pilih file video, isi judulnya — thumbnail dibuat otomatis di browser, tidak butuh FFmpeg di server.</p>
        </section>

        <div className="admin-grid">
          <UploadForm />

          <div className="panel">
            <h2>Film terupload</h2>
            <p className="subtitle">{movies.length} film di perpustakaan</p>

            {movies.length === 0 ? (
              <p className="hint">Belum ada film yang diupload.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Judul</th>
                    <th>Genre</th>
                    <th>Diupload oleh</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td>
                        {movie.thumbnailUrl ? (
                          <img className="admin-thumb" src={movie.thumbnailUrl} alt="" />
                        ) : (
                          <div className="admin-thumb" />
                        )}
                      </td>
                      <td><a href={`/watch/${movie.id}`}>{movie.title}</a></td>
                      <td>{movie.genre || "—"}</td>
                      <td>{movie.uploadedBy}</td>
                      <td><DeleteMovieButton movieId={movie.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <footer className="site-footer">FamilyMovie · koleksi pribadi keluarga</footer>
    </>
  );
}
