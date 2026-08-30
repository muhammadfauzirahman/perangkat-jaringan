import { db } from "@/lib/db";
import { unitKerja, jenisPerangkat, merk, gedung, ruangan, perangkat } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  let stats = {
    unitKerja: 0,
    jenisPerangkat: 0,
    merk: 0,
    gedung: 0,
    ruangan: 0,
    perangkat: 0,
  };
  let errorMsg = "";

  try {
    const [uk] = await db.select({ value: count() }).from(unitKerja);
    const [jp] = await db.select({ value: count() }).from(jenisPerangkat);
    const [m] = await db.select({ value: count() }).from(merk);
    const [g] = await db.select({ value: count() }).from(gedung);
    const [r] = await db.select({ value: count() }).from(ruangan);
    const [p] = await db.select({ value: count() }).from(perangkat);

    stats = {
      unitKerja: uk.value,
      jenisPerangkat: jp.value,
      merk: m.value,
      gedung: g.value,
      ruangan: r.value,
      perangkat: p.value,
    };
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">JARKITA</h1>

      {errorMsg ? (
        <div role="alert" className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-md">
          <p className="font-semibold">Gagal mengambil data dari database:</p>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{errorMsg}</pre>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Ringkasan master data di database:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Unit Kerja" value={stats.unitKerja} />
            <StatCard title="Jenis Perangkat" value={stats.jenisPerangkat} />
            <StatCard title="Merk" value={stats.merk} />
            <StatCard title="Gedung" value={stats.gedung} />
            <StatCard title="Ruangan" value={stats.ruangan} />
            <StatCard title="Perangkat" value={stats.perangkat} />
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-sm font-medium text-gray-500">{title}</h2>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}