import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".dev.vars" });

export default process.env.LOCAL_DB_PATH
  ? {
      schema: "./src/schema",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.LOCAL_DB_PATH,
      },
    }
  : defineConfig({
      schema: "./src/schema",
      dialect: "sqlite",
      out: "./migrations",
      driver: "d1-http",
    });
