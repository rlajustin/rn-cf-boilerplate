import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });
if (!process.env.DB_CONNECTION_STRING) {
  throw new Error("DB_CONNECTION_STRING is not set in the environment variables.");
}

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_CONNECTION_STRING,
  },
});
