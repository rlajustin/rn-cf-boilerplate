import { Hono } from "hono";
import { env } from "hono/adapter";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { loggerUtil, requestUtil } from "@utils";
import { typeConfig } from "@configs";
import { identityRoutes, appAttestRoutes, protectedRoutes, protectedUnverifiedRoutes } from "@routes";
import { cors } from "hono/cors";
import { version } from "../package.json";

export const loadRouters = (app: Hono<typeConfig.Context>) => {
  app.use(async (c, next) => {
    const { LOG_LEVEL: logLevel, ENVIRONMENT: environment } = env(c);
    if (logLevel === loggerUtil.LoggerLevel.Info || environment === "local") {
      const loggerMiddleware = logger(loggerUtil.customLogger);
      return loggerMiddleware(c, next);
    }
    await next();
  });

  app.use(async (c, next) => {
    const { ENVIRONMENT } = env(c);
    return cors({
      origin: ENVIRONMENT === "local" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : "*",
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "x-platform",
        "x-client-id",
        "x-request-id",
        "x-client-attestation",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })(c, next);
  });

  app.route("/api", identityRoutes);
  app.route("/api", appAttestRoutes);
  app.route("/api", protectedUnverifiedRoutes);
  app.route("/api", protectedRoutes);

  app.get("/", (c) => c.redirect("/status"));
  app.get("/status", (c) => {
    return c.json({
      message: "Welcome to Scroll Pact API",
      version,
      environment: c.env.ENVIRONMENT,
    });
  });

  if (process.env.ENVIRONMENT !== "prod") {
    app.get("/routes", (c) => {
      const routes = app.routes
        .map((r) => ({
          method: r.method,
          path: r.path,
        }))
        .filter((r) => r.path !== "/" && r.method !== "ALL");
      return c.json(routes);
    });
  }

  return app;
};
