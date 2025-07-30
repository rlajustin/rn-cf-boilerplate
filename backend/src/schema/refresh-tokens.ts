import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

// Refresh Tokens Table
export const refreshTokens = pgTable("refresh_tokens", {
  token: text("token").primaryKey(), // Store a hashed token for security
  userId: text("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  // Optionally, add metadata fields
  // summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: false }).notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
