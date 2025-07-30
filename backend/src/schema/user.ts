import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { AuthScope } from "shared/src/types";

/**
 * Base user table with core identity/auth fields (Postgres)
 */
export const users = pgTable("users", {
  // Core Identity
  userId: text("user_id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // generates a random uuid by default
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password

  // TODO support this?
  // phoneNumber: varchar('phone_number', { length: 32 }).notNull().unique(),
  // isPhoneVerified: boolean('is_phone_verified').notNull().default(false),

  // Account Status
  scope: text("scope", { enum: AuthScope }).notNull().default("unverified"),
  isActive: boolean("is_active").notNull().default(true),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: false }),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
