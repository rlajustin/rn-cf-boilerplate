import { defineConfig } from "drizzle-kit";
import { D1Helper } from "@nerdfolio/drizzle-d1-helpers";

const helper = D1Helper.get();

export default Number(process.env.LOCAL_DB_STUDIO ?? "0") === 1
  ? {
      schema: "./src/schema",
      dialect: "sqlite",
      dbCredentials: {
        url: helper.sqliteLocalFileCredentials.url,
      },
    }
  : defineConfig({
      schema: "./src/schema",
      dialect: "sqlite",
      out: "./migrations",
      driver: "d1-http",
    });
