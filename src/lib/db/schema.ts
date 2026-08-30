import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  doublePrecision,
  uuid,
  jsonb,
  pgEnum,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";
import { inet } from "drizzle-orm/pg-core/columns/inet";
import { sql } from "drizzle-orm";

// --- ENUMS ---

export const roleUserEnum = pgEnum("role_user", ["petugas", "admin"]);
export const jenisUnitKerjaEnum = pgEnum("jenis_unit_kerja", [
  "skpd",
  "kecamatan",
  "kelurahan",
  "puskesmas",
  "sekolah",
  "lainnya",
]);
export const kondisiPerangkatEnum = pgEnum("kondisi_perangkat", [
  "baik",
  "rusak_ringan",
  "rusak_berat",
]);
export const statusPerangkatEnum = pgEnum("status_perangkat", [
  "aktif",
  "tidak_aktif",
  "cadangan",
  "dihapus",
]);
export const aksiRiwayatEnum = pgEnum("aksi_riwayat", [
  "dibuat",
  "diubah",
  "mutasi",
  "perbaikan",
  "ubah_kondisi",
  "dihapus",
]);
export const aksiAuditEnum = pgEnum("aksi_audit", ["insert", "update", "delete"]);

// --- TABLES ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 120 }).notNull(),
  nip: varchar("nip", { length: 30 }).unique(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleUserEnum("role").notNull().default("petugas"),
  aktif: boolean("aktif").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const gedung = pgTable("gedung", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 160 }).notNull(),
  alamat: text("alamat"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusM: integer("radius_m").notNull().default(100),
  jumlahLantai: integer("jumlah_lantai").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const unitKerja = pgTable(
  "unit_kerja",
  {
    id: serial("id").primaryKey(),
    nama: varchar("nama", { length: 200 }).notNull(),
    jenis: jenisUnitKerjaEnum("jenis").notNull(),
    gedungId: integer("gedung_id").references(() => gedung.id, { onDelete: "set null" }),
    lantai: integer("lantai"),
    alamat: text("alamat"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    namaPic: varchar("nama_pic", { length: 120 }),
    kontakPic: varchar("kontak_pic", { length: 60 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("unit_kerja_nama_jenis_unique").on(t.nama, t.jenis)]
);

export const ruangan = pgTable(
  "ruangan",
  {
    id: serial("id").primaryKey(),
    unitKerjaId: integer("unit_kerja_id")
      .notNull()
      .references(() => unitKerja.id, { onDelete: "cascade" }),
    lantai: integer("lantai").notNull().default(1),
    nama: varchar("nama", { length: 120 }).notNull(),
  },
  (t) => [unique("ruangan_unit_kerja_lantai_nama_unique").on(t.unitKerjaId, t.lantai, t.nama)]
);

export const jenisPerangkat = pgTable("jenis_perangkat", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 80 }).notNull().unique(),
  ikon: varchar("ikon", { length: 40 }),
  urutan: integer("urutan").notNull().default(0),
});

export const merk = pgTable("merk", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 80 }).notNull().unique(),
});

export const sesiPendataan = pgTable("sesi_pendataan", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  unitKerjaId: integer("unit_kerja_id")
    .notNull()
    .references(() => unitKerja.id, { onDelete: "restrict" }),
  mulai: timestamp("mulai", { withTimezone: true }).notNull().defaultNow(),
  selesai: timestamp("selesai", { withTimezone: true }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

export const perangkat = pgTable(
  "perangkat",
  {
    id: serial("id").primaryKey(),
    clientUuid: uuid("client_uuid").notNull().unique(),
    unitKerjaId: integer("unit_kerja_id")
      .notNull()
      .references(() => unitKerja.id, { onDelete: "restrict" }),
    ruanganId: integer("ruangan_id").references(() => ruangan.id, { onDelete: "set null" }),
    jenisPerangkatId: integer("jenis_perangkat_id")
      .notNull()
      .references(() => jenisPerangkat.id, { onDelete: "restrict" }),
    merkId: integer("merk_id")
      .notNull()
      .references(() => merk.id, { onDelete: "restrict" }),
    model: varchar("model", { length: 120 }),
    serialNumber: varchar("serial_number", { length: 120 }),
    macAddress: varchar("mac_address", { length: 17 }),
    ipAddress: inet("ip_address"),
    jumlahPort: integer("jumlah_port"),
    tahunPembelian: integer("tahun_pembelian"),
    sumberDana: varchar("sumber_dana", { length: 120 }),
    kodeAset: varchar("kode_aset", { length: 80 }),
    kondisi: kondisiPerangkatEnum("kondisi").notNull(),
    status: statusPerangkatEnum("status").notNull().default("aktif"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    gpsAccuracy: doublePrecision("gps_accuracy"),
    catatan: text("catatan"),
    dicatatOleh: integer("dicatat_oleh")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sesiId: integer("sesi_id").references(() => sesiPendataan.id, { onDelete: "set null" }),
    diverifikasiOleh: integer("diverifikasi_oleh").references(() => users.id, {
      onDelete: "set null",
    }),
    diverifikasiPada: timestamp("diverifikasi_pada", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("perangkat_serial_number_aktif_idx")
      .on(t.serialNumber)
      .where(sql`${t.deletedAt} IS NULL AND ${t.serialNumber} IS NOT NULL`),
  ]
);

export const fotoPerangkat = pgTable("foto_perangkat", {
  id: serial("id").primaryKey(),
  perangkatId: integer("perangkat_id")
    .notNull()
    .references(() => perangkat.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  urutan: integer("urutan").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const riwayatPerangkat = pgTable("riwayat_perangkat", {
  id: serial("id").primaryKey(),
  perangkatId: integer("perangkat_id")
    .notNull()
    .references(() => perangkat.id, { onDelete: "cascade" }),
  aksi: aksiRiwayatEnum("aksi").notNull(),
  unitKerjaAsal: integer("unit_kerja_asal").references(() => unitKerja.id),
  unitKerjaTujuan: integer("unit_kerja_tujuan").references(() => unitKerja.id),
  kondisiLama: kondisiPerangkatEnum("kondisi_lama"),
  kondisiBaru: kondisiPerangkatEnum("kondisi_baru"),
  keterangan: text("keterangan"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  aksi: aksiAuditEnum("aksi").notNull(),
  tabel: varchar("tabel", { length: 60 }).notNull(),
  recordId: integer("record_id"),
  dataLama: jsonb("data_lama"),
  dataBaru: jsonb("data_baru"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});