import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { perangkat, users, unitKerja, jenisPerangkat, merk } from "./schema.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diset. Salin .env.example jadi .env.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log("Mulai check constraint...");

  // Siapkan data dummy untuk FK
  const [user] = await db
    .insert(users)
    .values({
      nama: "Test User",
      email: "test@example.com",
      passwordHash: "hash",
    })
    .onConflictDoUpdate({ target: users.email, set: { nama: "Test User" } })
    .returning();

  const [uk] = await db
    .insert(unitKerja)
    .values({ nama: "Test UK", jenis: "skpd" })
    .onConflictDoUpdate({ target: [unitKerja.nama, unitKerja.jenis], set: { nama: "Test UK" } })
    .returning();

  const [jp] = await db
    .insert(jenisPerangkat)
    .values({ nama: "Test JP" })
    .onConflictDoUpdate({ target: jenisPerangkat.nama, set: { nama: "Test JP" } })
    .returning();

  const [m] = await db
    .insert(merk)
    .values({ nama: "Test Merk" })
    .onConflictDoUpdate({ target: merk.nama, set: { nama: "Test Merk" } })
    .returning();

  const basePerangkat = {
    unitKerjaId: uk.id,
    jenisPerangkatId: jp.id,
    merkId: m.id,
    kondisi: "baik" as const,
    dicatatOleh: user.id,
  };

  // 1. Test partial unique index serial_number
  const serial = `SN-TEST-${Date.now()}`;
  const uuid1 = randomUUID();
  const uuid2 = randomUUID();

  // Insert pertama sukses
  const [p1] = await db
    .insert(perangkat)
    .values({ ...basePerangkat, clientUuid: uuid1, serialNumber: serial })
    .returning();

  // Insert kedua dengan serial sama harus gagal
  let errorCaught = false;
  try {
    await db.insert(perangkat).values({ ...basePerangkat, clientUuid: uuid2, serialNumber: serial });
  } catch (err: unknown) {
    errorCaught = true;
    const msg = err instanceof Error ? String((err as { cause?: unknown }).cause || err.message) : String(err);
    assert.match(
      msg,
      /duplicate key value violates unique constraint "perangkat_serial_number_aktif_idx"/,
      "Error message tidak sesuai"
    );
  }
  assert.ok(errorCaught, "Seharusnya gagal insert serial number duplikat pada perangkat aktif");

  // Soft delete perangkat pertama
  await db.update(perangkat).set({ deletedAt: new Date() }).where(eq(perangkat.id, p1.id));

  // Insert kedua dengan serial sama sekarang harus sukses
  await db.insert(perangkat).values({ ...basePerangkat, clientUuid: uuid2, serialNumber: serial });
  console.log("Check 1: Partial unique index serial_number OK.");

  // 2. Test unique constraint client_uuid
  const uuid3 = randomUUID();
  await db.insert(perangkat).values({ ...basePerangkat, clientUuid: uuid3 });

  let errorCaught2 = false;
  try {
    await db.insert(perangkat).values({ ...basePerangkat, clientUuid: uuid3 });
  } catch (err: unknown) {
    errorCaught2 = true;
    const msg = err instanceof Error ? String((err as { cause?: unknown }).cause || err.message) : String(err);
    assert.match(
      msg,
      /duplicate key value violates unique constraint "perangkat_client_uuid_unique"/,
      "Error message tidak sesuai"
    );
  }
  assert.ok(errorCaught2, "Seharusnya gagal insert client_uuid duplikat");

  // Test onConflictDoUpdate dengan client_uuid
  const res = await db
    .insert(perangkat)
    .values({ ...basePerangkat, clientUuid: uuid3, catatan: "Updated" })
    .onConflictDoUpdate({ target: perangkat.clientUuid, set: { catatan: "Updated" } })
    .returning();

  assert.strictEqual(res.length, 1, "onConflictDoUpdate harus mengembalikan 1 baris");
  assert.strictEqual(res[0].catatan, "Updated", "Catatan harus terupdate");
  console.log("Check 2: Unique constraint client_uuid OK.");

  // Cleanup
  await db.delete(perangkat).where(eq(perangkat.dicatatOleh, user.id));
  await db.delete(users).where(eq(users.id, user.id));

  console.log("Semua check constraint lolos.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error saat check:", err);
  process.exit(1);
});