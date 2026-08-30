import { db } from "@/db";
import { users } from "@/db/schema";

// Halaman bukti koneksi: baca tabel percobaan lalu tampilkan.
// Ganti dengan halaman aplikasi asli di issue berikutnya.
export const dynamic = "force-dynamic";

export default async function Home() {
  let rows: (typeof users.$inferSelect)[] = [];
  let error: string | null = null;

  try {
    rows = await db.select().from(users).orderBy(users.id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal terhubung ke database";
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">JARKITA</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Bukti koneksi Next.js &rarr; Drizzle &rarr; PostgreSQL.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          <p className="font-medium">Koneksi database gagal.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2">
            Pastikan database jalan dan migration sudah diterapkan. Lihat README.
          </p>
        </div>
      ) : (
        <section className="mt-6">
          <h2 className="text-sm font-medium">
            Tabel <code>users</code> &mdash; {rows.length} baris
          </h2>

          {rows.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tabel kosong. Koneksi tetap terbukti berhasil karena query tidak
              error.
            </p>
          ) : (
            <table className="mt-2 w-full border-collapse text-sm">
              <caption className="sr-only">Isi tabel percobaan users</caption>
              <thead>
                <tr className="border-b text-left">
                  <th scope="col" className="py-2 pr-4">
                    ID
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Nama
                  </th>
                  <th scope="col" className="py-2">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-4">{u.id}</td>
                    <td className="py-2 pr-4">{u.nama}</td>
                    <td className="py-2">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </main>
  );
}
