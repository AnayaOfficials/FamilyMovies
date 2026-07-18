// app/register/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.target);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal daftar.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Nav currentUser={null} />
      <main className="auth-shell">
        <div className="auth-card">
          <h1>Gabung keluarga</h1>
          <p className="subtitle">Buat akun member untuk mulai nonton.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" required minLength={6} />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Konfirmasi password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="auth-switch">
            Sudah punya akun? <a href="/login">Masuk di sini</a>
          </p>
        </div>
      </main>
    </>
  );
}
