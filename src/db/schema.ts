import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

/**
 * Tabel percobaan untuk membuktikan alur skema -> migration -> database.
 * Skema domain JARKITA yang sebenarnya menyusul di issue berikutnya.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
