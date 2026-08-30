import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { unitKerja, jenisPerangkat, merk } from "./schema.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diset. Salin .env.example jadi .env.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log("Mulai seed master data...");

  // 1. Jenis Perangkat
  const jenisData = [
    { nama: "Access Point", ikon: "wifi", urutan: 1 },
    { nama: "Router", ikon: "router", urutan: 2 },
    { nama: "Switch", ikon: "switch", urutan: 3 },
    { nama: "ONT", ikon: "modem", urutan: 4 },
    { nama: "Firewall", ikon: "shield", urutan: 5 },
    { nama: "Server", ikon: "server", urutan: 6 },
    { nama: "UPS", ikon: "battery", urutan: 7 },
    { nama: "Lainnya", ikon: "box", urutan: 8 },
  ];
  await db.insert(jenisPerangkat).values(jenisData).onConflictDoNothing({ target: jenisPerangkat.nama });
  console.log(`Seed jenis_perangkat selesai (${jenisData.length} baris).`);

  // 2. Merk
  const merkData = [
    { nama: "Cisco" },
    { nama: "TP-Link" },
    { nama: "Ubiquiti" },
    { nama: "MikroTik" },
    { nama: "Aruba" },
    { nama: "Huawei" },
    { nama: "ZTE" },
    { nama: "D-Link" },
    { nama: "Ruijie" },
    { nama: "Fortinet" },
    { nama: "Lainnya" },
  ];
  await db.insert(merk).values(merkData).onConflictDoNothing({ target: merk.nama });
  console.log(`Seed merk selesai (${merkData.length} baris).`);

  // 3. Unit Kerja
  const skpd = [
    "Sekretariat Daerah",
    "Sekretariat DPRD",
    "Badan Kepegawaian Daerah, Pendidikan dan Pelatihan",
    "Badan Kesatuan Bangsa dan Politik",
    "Badan Pengelola Keuangan Pendapatan dan Aset Daerah",
    "Badan Penanggulangan Bencana Daerah",
    "Badan Perencanaan Pembangunan Daerah - Penelitian dan Pengembangan",
    "Dinas Kebudayaan, Kepemudaan, Olahraga dan Pariwisata",
    "Dinas Kependudukan dan Pencatatan Sipil",
    "Dinas Kesehatan",
    "Dinas Ketahanan Pangan Pertanian dan Perikanan",
    "Dinas Komunikasi, Informatika dan Statistik",
    "Dinas Koperasi, Usaha Mikro dan Tenaga Kerja",
    "Dinas Lingkungan Hidup",
    "Dinas Pekerjaan Umum dan Perumahan Rakyat",
    "Dinas Pemberdayaan Perempuan dan Perlindungan Anak",
    "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu",
    "Dinas Pendidikan",
    "Dinas Pengedalian Penduduk, KB dan Pemberdayaan Masyarakat",
    "Dinas Perdagangan dan Perindustrian",
    "Dinas Perhubungan",
    "Dinas Perpustakaan dan Arsip",
    "Dinas Perumahan dan Kawasan Permukiman",
    "Dinas Pemadam Kebakaran dan Penyelamatan",
    "Dinas Sosial",
    "Inspektorat",
    "Satuan Polisi Pamong Praja",
  ].map((nama) => ({ nama, jenis: "skpd" as const }));

  const kecamatan = [
    "Banjarmasin Barat",
    "Banjarmasin Selatan",
    "Banjarmasin Tengah",
    "Banjarmasin Timur",
    "Banjarmasin Utara",
  ].map((nama) => ({ nama, jenis: "kecamatan" as const }));

  const kelurahan = [
    // Barat
    "Basirih", "Belitung Selatan", "Belitung Utara", "Kuin Cerucuk", "Kuin Selatan", "Pelambuan", "Telaga Biru", "Telawang", "Teluk Tiram",
    // Selatan
    "Basirih Selatan", "Kelayan Barat", "Kelayan Dalam", "Kelayan Tengah", "Kelayan Timur", "Kelayan Selatan", "Mantuil", "Murung Raya", "Pekauman", "Pemurus Baru", "Pemurus Dalam", "Tanjung Pagar",
    // Tengah
    "Antasan Besar", "Gadang", "Kertak Baru Ilir", "Kertak Baru Ulu", "Kelayan Luar", "Mawar", "Melayu", "Pasar Lama", "Pekapuran Laut", "Seberang Mesjid", "Sungai Baru", "Teluk Dalam",
    // Timur
    "Benua Anyar", "Karang Mekar", "Kebun Bunga", "Kuripan", "Pekapuran Raya", "Pemurus Luar", "Pengambangan", "Sungai Bilu", "Sungai Lulut",
    // Utara
    "Alalak Utara", "Alalak Tengah", "Alalak Selatan", "Antasan Kecil Timur", "Kuin Utara", "Pangeran", "Sungai Andai", "Sungai Jingah", "Sungai Miai", "Surgi Mufti",
  ].map((nama) => ({ nama, jenis: "kelurahan" as const }));

  const puskesmas = [
    "Cempaka Putih", "9 Nopember", "Sungai Bilu", "Pekapuran Raya", "Karang Mekar", "Terminal", "Cempaka", "Teluk Dalam", "S.Parman", "Sungai Mesa", "Gadang Hanyar", "Pekauman", "Pemurus Dalam", "Pemurus Baru", "Kelayan Dalam", "Beruntung Raya", "Kelayan Timur", "Mantuil", "Kuin Raya", "Teluk Tiram", "Pelambuan", "Banjarmasin Indah", "Kayutangi", "Alalak Selatan", "Alalak Tengah", "Sungai Jingah", "Sungai Andai",
  ].map((nama) => ({ nama, jenis: "puskesmas" as const }));

  const unitKerjaData = [...skpd, ...kecamatan, ...kelurahan, ...puskesmas];
  await db.insert(unitKerja).values(unitKerjaData).onConflictDoNothing({ target: [unitKerja.nama, unitKerja.jenis] });
  console.log(`Seed unit_kerja selesai (${unitKerjaData.length} baris).`);

  console.log("Seed selesai.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error saat seed:", err);
  process.exit(1);
});