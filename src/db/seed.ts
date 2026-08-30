import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema.ts";

// Isi tabel percobaan supaya halaman bukti koneksi punya data untuk
// ditampilkan. Aman dijalankan berulang.
//
// ponytail: script ini bikin koneksi sendiri, tidak pakai src/db/index.ts,
// karena Node menjalankan file .ts ini tanpa bundler dan butuh ekstensi
// eksplisit di setiap import relatif. Kalau nanti seed makin besar,
// pakai tsx atau jalankan lewat route handler.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diset. Salin .env.example jadi .env.");
}

const db = drizzle(process.env.DATABASE_URL);

await db
  .insert(users)
  .values([
    { nama: "Admin Diskominfo", email: "admin@example.test" },
    { nama: "Petugas Lapangan", email: "petugas@example.test" },
  ])
  .onConflictDoNothing();

const rows = await db.select().from(users);
console.log(`seed selesai, tabel users berisi ${rows.length} baris`);
process.exit(0);
