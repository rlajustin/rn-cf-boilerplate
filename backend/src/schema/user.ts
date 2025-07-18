import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { AuthScope } from "shared/src/types";

/**
 * Base user table with core identity/auth fields
 */
export const users = sqliteTable("users", {
  // Core Identity
  userId: text("user_id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  password: text("password").notNull(), // we will send from client/store in db the hashed password instead

  // TODO support this?
  // phoneNumber: text('phone_number').notNull().unique(),
  // isPhoneVerified: integer('is_phone_verified', { mode: 'boolean' }).notNull().default(false),

  // Account Status
  scope: text("scope", { enum: AuthScope }).notNull().default("unverified"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

  // Timestamps
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"), // possible flow is to keep for 30 days, then delete via cron job
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
