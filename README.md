# JARKITA

Inventaris perangkat jaringan Pemerintah Kota Banjarmasin.

Repo ini berisi skema domain lengkap JARKITA (12 tabel, 6 enum) dan master data nyata.

## Stack

| Bagian    | Pilihan                   | Versi            |
| --------- | ------------------------- | ---------------- |
| Framework | Next.js (App Router)      | 16.3.3           |
| UI        | React + Tailwind CSS      | 19.2.8 / 4.3.3   |
| ORM       | Drizzle ORM + drizzle-kit | 0.45.2 / 0.31.10 |
| Driver    | pg                        | 8.23.0           |
| Database  | PostgreSQL (Docker)       | 17-alpine        |
| Bahasa    | TypeScript                | 5.9.3            |

Semua versi dipin eksak (tanpa `^`) supaya hasil install sama di semua mesin dan tidak ada dependency yang naik minor tanpa disengaja.

## Prasyarat

- Node.js 22 atau lebih baru (dites di 24.15.0)
- Docker Desktop (untuk database lokal)

## Setup dari nol

1. Install dependency:

   ```powershell
   npm install
   ```

2. Salin template environment lalu isi passwordnya:

   ```powershell
   Copy-Item .env.example .env
   ```

   Buka `.env`, ganti `ganti_password_ini` dengan password acak, dan pakai password yang sama di `POSTGRES_PASSWORD` maupun di `DATABASE_URL`.

3. Jalankan database:

   ```powershell
   docker compose up -d
   ```

   Tunggu sampai statusnya `healthy`:

   ```powershell
   docker compose ps
   ```

4. Terapkan migration (file SQL-nya sudah ada di `drizzle/`, jadi tidak perlu generate ulang):

   ```powershell
   npm run db:migrate
   ```

5. Isi master data (111 unit kerja, jenis perangkat, merk):

   ```powershell
   npm run db:seed
   ```

6. Verifikasi constraint database:

   ```powershell
   npm run db:check
   ```

7. Jalankan dev server:

   ```powershell
   npm run dev
   ```

   Buka <http://localhost:3000>. Halaman menampilkan ringkasan jumlah baris tiap tabel master. Kalau koneksi gagal, halaman menampilkan pesan error, bukan crash.

## Script

| Script                | Fungsi                                                |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Dev server                                            |
| `npm run build`       | Build production                                      |
| `npm start`           | Jalankan hasil build                                  |
| `npm run lint`        | ESLint                                                |
| `npm run db:generate` | Buat file migration dari perubahan `src/lib/db/schema.ts` |
| `npm run db:migrate`  | Terapkan migration ke database                        |
| `npm run db:seed`     | Isi master data                                       |
| `npm run db:check`    | Verifikasi constraint database                        |
| `npm run db:studio`   | Drizzle Studio (GUI database)                         |

## Struktur

```
drizzle/            file migration hasil generate
src/app/            route App Router
  layout.tsx        layout root
  page.tsx          halaman ringkasan master data
src/lib/db/
  index.ts          koneksi database (Pool + instance Drizzle)
  schema.ts         definisi 12 tabel domain + 6 enum
  queries.ts        helper query
  seed.ts           isi master data
  check.ts          verifikasi constraint
drizzle.config.ts   konfigurasi drizzle-kit
docker-compose.yml  PostgreSQL untuk development
```

## Keputusan default yang perlu diketahui

**Database di port 5434, bukan 5432.** Di mesin development ini port 5432 dipakai service PostgreSQL native Windows (`postgresql-x64-18`) dan 5433 dipakai container project lain. Menaruh container di 5432 bikin koneksi diam-diam nyasar ke server yang salah dan gagal dengan `28P01 password authentication failed` walaupun passwordnya benar. Kalau di mesin Anda 5432 bebas, ubah `POSTGRES_PORT` dan `DATABASE_URL` di `.env` sesuai kebutuhan — `docker-compose.yml` sudah ambil nilainya dari environment.

**Database lewat Docker Compose, bukan install native.** Supaya versi PostgreSQL seragam antar mesin dan bisa dibuang tanpa sisa.

**Kredensial hanya di `.env`.** File `.env` masuk `.gitignore`; yang di-commit hanya `.env.example`. Tidak ada password di `docker-compose.yml` maupun di source.

**Tabel domain lengkap.** Menggantikan tabel percobaan sebelumnya. Terdiri dari 12 tabel dan 6 enum.

**`src/lib/db/seed.ts` dan `check.ts` bikin koneksi sendiri** dan tidak mengimpor `src/lib/db/index.ts`, karena Node menjalankan file `.ts` itu tanpa bundler sehingga setiap import relatif butuh ekstensi eksplisit. Konsekuensinya `allowImportingTsExtensions` diaktifkan di `tsconfig.json`.

**Koneksi memakai satu `Pool` global.** Cukup untuk deploy satu proses (on-prem / container). Kalau dipindah ke serverless, ganti ke driver serverless atau tambahkan connection pooler.
