// app/not-found.js
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";

export default async function NotFound() {
  const currentUser = await getCurrentUser().catch(() => null);
  return (
    <>
      <Nav currentUser={currentUser} />
      <main className="message-shell">
        <h1>404</h1>
        <p>Film yang kamu cari tidak ada atau sudah dihapus.</p>
        <br />
        <a href="/" className="btn btn-primary">Kembali ke beranda</a>
      </main>
    </>
  );
}
