# FamilyMovie (versi Vercel)

Versi ini dibuat khusus supaya bisa **di-deploy ke Vercel** dan ditonton oleh
keluarga dari HP/laptop masing-masing lewat internet — bukan cuma dari satu
komputer di rumah.

## Kenapa strukturnya beda dari versi sebelumnya?

Vercel itu **serverless**: tidak ada folder lokal yang "nempel" permanen, dan
tidak ada proses FFmpeg yang bisa jalan lama di background. Jadi 3 hal
diganti:

| Sebelumnya (Express, di laptop) | Sekarang (Next.js, di Vercel) |
|---|---|
| Video disimpan di folder `public/uploads` | Video disimpan di **Vercel Blob** (object storage) |
| Database file `db.json` | **Upstash Redis** (lewat Vercel Marketplace) |
| Thumbnail dibuat oleh FFmpeg di server | Thumbnail diambil otomatis **di browser** (canvas) saat admin memilih video — jadi tetap otomatis, cuma prosesnya pindah ke sisi browser |
| Sesi login disimpan di memori server | Sesi login disimpan di **cookie JWT** (supaya tetap jalan walau tiap request masuk ke server serverless yang berbeda-beda) |

## Yang perlu disiapkan sebelum deploy

1. Akun **Vercel** (gratis) — https://vercel.com
2. Project ini sudah di-push ke GitHub/GitLab/Bitbucket (paling gampang deploy dari situ), atau pakai Vercel CLI langsung dari komputer.

## Langkah deploy

### 1. Import project ke Vercel
- Push folder ini ke repo GitHub baru
- Di dashboard Vercel: **Add New → Project** → pilih repo tersebut → Deploy
  (biarkan dulu gagal/dijalankan, karena environment variable belum diisi — lanjut ke langkah berikut lalu redeploy)

### 2. Buat Blob store (untuk simpan video & thumbnail)
- Di project Vercel: tab **Storage → Create Database → Blob**
- Setelah dibuat, klik **Connect Project** ke project ini
- Vercel otomatis menambahkan environment variable `BLOB_READ_WRITE_TOKEN`

### 3. Sambungkan Upstash Redis (untuk simpan data user & film)
- Tab **Storage → Create Database → Marketplace Database Providers → Upstash**
- Pilih Redis, hubungkan ke project ini
- Vercel otomatis menambahkan `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`

### 4. Tambahkan environment variable sendiri
Di tab **Settings → Environment Variables**, tambahkan:

| Nama | Nilai |
|---|---|
| `JWT_SECRET` | string acak panjang, misal hasil dari `openssl rand -base64 32` |
| `ADMIN_USERNAME` | username admin yang kamu mau (default: `admin`) |
| `ADMIN_PASSWORD` | password admin yang kamu mau (default: `admin123`) |

### 5. Redeploy
Tab **Deployments → titik tiga di deployment terakhir → Redeploy**.

Selesai — buka URL project kamu (mis. `https://familymovie.vercel.app`), lalu login pakai `ADMIN_USERNAME` / `ADMIN_PASSWORD` yang kamu set tadi.

## Cara pakai

1. Login sebagai admin → **Panel Admin** → upload video + judul.
   Thumbnail otomatis diambil dari frame video begitu file dipilih.
2. Keluarga buka URL yang sama dari HP masing-masing → daftar akun di
   halaman **Daftar** (`/register`) → login → langsung bisa nonton semua
   film yang ada, lengkap dengan thumbnail-nya.
3. Tiap orang bisa akses dari perangkat berbeda kapan saja, selama ada internet — karena semuanya (video, data user, sesi login) sekarang disimpan di layanan cloud, bukan di satu laptop.

## Menjalankan di komputer sendiri (opsional, untuk development)

```bash
npm install
vercel env pull .env.local   # ambil token Blob & Redis dari project Vercel-mu
npm run dev
```

Buka `http://localhost:3000`.

> Catatan: proses upload butuh `BLOB_READ_WRITE_TOKEN` dan kredensial Upstash
> yang valid, jadi kamu perlu sudah menyambungkan keduanya di dashboard
> Vercel dulu (langkah 2 & 3 di atas) sebelum `vercel env pull` bisa ambil
> nilainya.

## Batasan & hal yang perlu kamu tahu

- **Ukuran file**: Vercel Blob mendukung file sampai 500MB langsung, dan
  sampai 5TB dengan multipart upload (video kamu di project ini otomatis
  pakai jalur *client upload* yang tidak kena limit 4.5MB dari Vercel Functions).
- **Privasi video**: untuk kesederhanaan, video disimpan sebagai Blob
  **publik** (URL-nya acak dan sulit ditebak, tapi kalau seseorang tahu
  URL persis-nya, dia bisa buka videonya langsung tanpa login). Ini cukup
  untuk pemakaian keluarga biasa. Kalau kamu mau proteksi lebih ketat
  (video benar-benar tidak bisa diakses tanpa login sama sekali), beri tahu
  saya — bisa di-upgrade pakai Vercel Blob **private storage** + signed URL.
- **Ganti password admin default** setelah deploy pertama demi keamanan.
- Siapa pun saat ini bisa mendaftar akun member sendiri di `/register`.
  Kalau kamu mau daftar member dibatasi (misal harus diundang admin dulu),
  saya bisa bantu ubah alurnya.

## Struktur project

```
FamilyMovieVercel/
├── middleware.js              # proteksi halaman (login/admin) di Edge
├── lib/
│   ├── jwt.js                 # sign/verify sesi login (edge + node safe)
│   ├── password.js             # hash password (Node only)
│   ├── db.js                   # data user & film via Upstash Redis
│   └── session.js              # baca user yang sedang login
├── components/
│   ├── Nav.js
│   ├── UploadForm.js            # capture thumbnail otomatis + upload
│   └── DeleteMovieButton.js
├── app/
│   ├── layout.js / globals.css   # tema visual "home theater marquee"
│   ├── page.js                   # beranda (daftar film)
│   ├── login/, register/         # halaman auth
│   ├── watch/[id]/                # halaman nonton
│   ├── admin/                     # panel admin
│   └── api/
│       ├── auth/{login,register,logout}/
│       ├── upload/{video,thumbnail}/
│       └── movies/, movies/[id]/
```
