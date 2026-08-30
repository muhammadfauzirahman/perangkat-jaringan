CREATE TYPE "public"."aksi_audit" AS ENUM('insert', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."aksi_riwayat" AS ENUM('dibuat', 'diubah', 'mutasi', 'perbaikan', 'ubah_kondisi', 'dihapus');--> statement-breakpoint
CREATE TYPE "public"."jenis_unit_kerja" AS ENUM('skpd', 'kecamatan', 'kelurahan', 'puskesmas', 'sekolah', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."kondisi_perangkat" AS ENUM('baik', 'rusak_ringan', 'rusak_berat');--> statement-breakpoint
CREATE TYPE "public"."role_user" AS ENUM('petugas', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status_perangkat" AS ENUM('aktif', 'tidak_aktif', 'cadangan', 'dihapus');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"aksi" "aksi_audit" NOT NULL,
	"tabel" varchar(60) NOT NULL,
	"record_id" integer,
	"data_lama" jsonb,
	"data_baru" jsonb,
	"ip" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foto_perangkat" (
	"id" serial PRIMARY KEY NOT NULL,
	"perangkat_id" integer NOT NULL,
	"storage_key" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gedung" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(160) NOT NULL,
	"alamat" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"radius_m" integer DEFAULT 100 NOT NULL,
	"jumlah_lantai" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jenis_perangkat" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(80) NOT NULL,
	"ikon" varchar(40),
	"urutan" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "jenis_perangkat_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "merk" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(80) NOT NULL,
	CONSTRAINT "merk_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "perangkat" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_uuid" uuid NOT NULL,
	"unit_kerja_id" integer NOT NULL,
	"ruangan_id" integer,
	"jenis_perangkat_id" integer NOT NULL,
	"merk_id" integer NOT NULL,
	"model" varchar(120),
	"serial_number" varchar(120),
	"mac_address" varchar(17),
	"ip_address" "inet",
	"jumlah_port" integer,
	"tahun_pembelian" integer,
	"sumber_dana" varchar(120),
	"kode_aset" varchar(80),
	"kondisi" "kondisi_perangkat" NOT NULL,
	"status" "status_perangkat" DEFAULT 'aktif' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"gps_accuracy" double precision,
	"catatan" text,
	"dicatat_oleh" integer NOT NULL,
	"sesi_id" integer,
	"diverifikasi_oleh" integer,
	"diverifikasi_pada" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "perangkat_client_uuid_unique" UNIQUE("client_uuid")
);
--> statement-breakpoint
CREATE TABLE "riwayat_perangkat" (
	"id" serial PRIMARY KEY NOT NULL,
	"perangkat_id" integer NOT NULL,
	"aksi" "aksi_riwayat" NOT NULL,
	"unit_kerja_asal" integer,
	"unit_kerja_tujuan" integer,
	"kondisi_lama" "kondisi_perangkat",
	"kondisi_baru" "kondisi_perangkat",
	"keterangan" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ruangan" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_kerja_id" integer NOT NULL,
	"lantai" integer DEFAULT 1 NOT NULL,
	"nama" varchar(120) NOT NULL,
	CONSTRAINT "ruangan_unit_kerja_lantai_nama_unique" UNIQUE("unit_kerja_id","lantai","nama")
);
--> statement-breakpoint
CREATE TABLE "sesi_pendataan" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"unit_kerja_id" integer NOT NULL,
	"mulai" timestamp with time zone DEFAULT now() NOT NULL,
	"selesai" timestamp with time zone,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_kerja" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(200) NOT NULL,
	"jenis" "jenis_unit_kerja" NOT NULL,
	"gedung_id" integer,
	"lantai" integer,
	"alamat" text,
	"latitude" double precision,
	"longitude" double precision,
	"nama_pic" varchar(120),
	"kontak_pic" varchar(60),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unit_kerja_nama_jenis_unique" UNIQUE("nama","jenis")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(120) NOT NULL,
	"nip" varchar(30),
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role_user" DEFAULT 'petugas' NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_nip_unique" UNIQUE("nip"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foto_perangkat" ADD CONSTRAINT "foto_perangkat_perangkat_id_perangkat_id_fk" FOREIGN KEY ("perangkat_id") REFERENCES "public"."perangkat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_unit_kerja_id_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_id") REFERENCES "public"."unit_kerja"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_ruangan_id_ruangan_id_fk" FOREIGN KEY ("ruangan_id") REFERENCES "public"."ruangan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_jenis_perangkat_id_jenis_perangkat_id_fk" FOREIGN KEY ("jenis_perangkat_id") REFERENCES "public"."jenis_perangkat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_merk_id_merk_id_fk" FOREIGN KEY ("merk_id") REFERENCES "public"."merk"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_dicatat_oleh_users_id_fk" FOREIGN KEY ("dicatat_oleh") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_sesi_id_sesi_pendataan_id_fk" FOREIGN KEY ("sesi_id") REFERENCES "public"."sesi_pendataan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perangkat" ADD CONSTRAINT "perangkat_diverifikasi_oleh_users_id_fk" FOREIGN KEY ("diverifikasi_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_perangkat" ADD CONSTRAINT "riwayat_perangkat_perangkat_id_perangkat_id_fk" FOREIGN KEY ("perangkat_id") REFERENCES "public"."perangkat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_perangkat" ADD CONSTRAINT "riwayat_perangkat_unit_kerja_asal_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_asal") REFERENCES "public"."unit_kerja"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_perangkat" ADD CONSTRAINT "riwayat_perangkat_unit_kerja_tujuan_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_tujuan") REFERENCES "public"."unit_kerja"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_perangkat" ADD CONSTRAINT "riwayat_perangkat_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_unit_kerja_id_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_id") REFERENCES "public"."unit_kerja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_pendataan" ADD CONSTRAINT "sesi_pendataan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesi_pendataan" ADD CONSTRAINT "sesi_pendataan_unit_kerja_id_unit_kerja_id_fk" FOREIGN KEY ("unit_kerja_id") REFERENCES "public"."unit_kerja"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_kerja" ADD CONSTRAINT "unit_kerja_gedung_id_gedung_id_fk" FOREIGN KEY ("gedung_id") REFERENCES "public"."gedung"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "perangkat_serial_number_aktif_idx" ON "perangkat" USING btree ("serial_number") WHERE "perangkat"."deleted_at" IS NULL AND "perangkat"."serial_number" IS NOT NULL;