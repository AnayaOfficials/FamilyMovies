// components/UploadForm.js
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

// Grabs one frame from the video file the admin just picked and turns it
// into a JPEG Blob. This is what makes the thumbnail "automatic" now that
// there's no server-side FFmpeg step to rely on — the browser itself has
// everything needed to decode a frame and paint it to a <canvas>.
function captureThumbnailFromFile(file) {
  return new Promise((resolve, reject) => {
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.src = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(videoEl.src);

    videoEl.onloadedmetadata = () => {
      const seekTo = Math.min(Math.max(videoEl.duration * 0.1, 1), 20) || 1;
      videoEl.currentTime = seekTo;
    };

    videoEl.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = Math.round(500 * (videoEl.videoHeight / videoEl.videoWidth || 1.5));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          blob ? resolve(blob) : reject(new Error("Gagal mengambil thumbnail dari video."));
        },
        "image/jpeg",
        0.85
      );
    };

    videoEl.onerror = () => {
      cleanup();
      reject(new Error("Browser tidak bisa membaca file video ini untuk membuat thumbnail."));
    };
  });
}

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    setProgress(0);

    const form = formRef.current;
    const fileInput = form.elements.namedItem("video");
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Pilih file video terlebih dahulu.");
      setBusy(false);
      return;
    }

    try {
      setStatus("Membuat thumbnail otomatis dari video...");
      let thumbnailBlob = null;
      try {
        thumbnailBlob = await captureThumbnailFromFile(file);
      } catch (thumbErr) {
        console.warn("Thumbnail otomatis gagal, lanjut tanpa thumbnail:", thumbErr);
        thumbnailBlob = null;
      }

      setStatus("Mengupload video...");
      const videoBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/video",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      let thumbBlob = null;
      if (thumbnailBlob) {
        setStatus("Mengupload thumbnail...");
        const thumbFilename = `${Date.now()}.jpg`;
        const thumbRes = await fetch(`/api/upload/thumbnail?filename=${thumbFilename}`, {
          method: "POST",
          body: thumbnailBlob,
        });
        if (thumbRes.ok) {
          thumbBlob = await thumbRes.json();
        } else {
          console.warn("Upload thumbnail gagal, lanjut tanpa thumbnail.");
        }
      }

      setStatus("Menyimpan data film...");
      const movieRes = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.elements.namedItem("title").value,
          description: form.elements.namedItem("description").value,
          genre: form.elements.namedItem("genre").value,
          videoUrl: videoBlob.url,
          videoPathname: videoBlob.pathname,
          mimeType: file.type,
          thumbnailUrl: thumbBlob?.url || null,
          thumbnailPathname: thumbBlob?.pathname || null,
        }),
      });
      const movieData = await movieRes.json();
      if (!movieRes.ok) throw new Error(movieData.error || "Gagal menyimpan film.");

      setStatus(
        thumbBlob
          ? `"${movieData.title}" berhasil diupload.`
          : `"${movieData.title}" berhasil diupload (tanpa thumbnail otomatis — video ini tidak bisa dibaca browser untuk membuat thumbnail).`
      );
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err.message || "Upload gagal.");
      setStatus(null);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <div className="panel">
      <h2>Upload</h2>
      <p className="subtitle">Thumbnail dibuat otomatis dari frame video — tidak perlu upload poster terpisah.</p>

      {error && <div className="form-error">{error}</div>}
      {status && !error && <div className="form-success">{status}</div>}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="video">File video</label>
          <input type="file" id="video" name="video" accept="video/*" required disabled={busy} />
        </div>
        <div className="field">
          <label htmlFor="title">Judul film</label>
          <input type="text" id="title" name="title" required placeholder="mis. Petualangan Liburan 2024" disabled={busy} />
        </div>
        <div className="field">
          <label htmlFor="genre">Genre / label</label>
          <input type="text" id="genre" name="genre" placeholder="mis. Dokumenter Keluarga" disabled={busy} />
        </div>
        <div className="field">
          <label htmlFor="description">Deskripsi singkat</label>
          <textarea id="description" name="description" placeholder="Ceritakan sedikit tentang film ini" disabled={busy} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? "Mengupload..." : "Upload & buat thumbnail otomatis"}
        </button>

        {busy && progress > 0 && (
          <div className="upload-progress-track">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
        {busy && <p className="upload-status">{status}</p>}
      </form>
    </div>
  );
}
