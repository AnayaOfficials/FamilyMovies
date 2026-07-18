// components/DeleteMovieButton.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMovieButton({ movieId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus film ini?")) return;
    setBusy(true);
    await fetch(`/api/movies/${movieId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
      {busy ? "Menghapus..." : "Hapus"}
    </button>
  );
}
