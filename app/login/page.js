// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal masuk.");
      return;
    }
    router.push(data.role === "admin" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <>
      <Nav currentUser={null} />
      <main className="auth-shell">
        <div className="auth-card">
          <h1>Selamat datang</h1>
          <p className="subtitle">Masuk untuk mulai nonton koleksi keluarga.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="auth-switch">
            Belum punya akun? <a href="/register">Daftar sebagai member</a>
          </p>
        </div>
      </main>
    </>
  );
}
