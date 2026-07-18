// components/Nav.js
export default function Nav({ currentUser }) {
  return (
    <header className="marquee-bar">
      <a href="/" className="brand">
        <span className="brand-dot"></span>
        Family<span className="brand-accent">Movie</span>
      </a>

      {currentUser && (
        <nav className="nav-links">
          <a href="/" className="nav-link">Tonton</a>
          {currentUser.role === "admin" && (
            <a href="/admin" className="nav-link">Panel Admin</a>
          )}
          <span className="nav-user">Hai, {currentUser.username}</span>
          <form action="/api/auth/logout" method="POST" className="inline-form">
            <button type="submit" className="btn btn-ghost">Keluar</button>
          </form>
        </nav>
      )}
    </header>
  );
}
