import { Hono, Context, Next } from "hono";
import { env } from "hono/adapter";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";

import { loggerUtil, authUtil } from "@utils";
import { typeConfig, errorConfig } from "@configs";
import { identityRoutes, appAttestRoutes, protectedRoutes, protectedUnverifiedRoutes } from "@routes";
import { version } from "../package.json";
import { jwtService } from "@services";
import { dbMiddleware } from "@middleware";

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
    // If x-platform is 'mobile', disallow all origins. Protects browsers from CSRF that attempts to steal cookies, as we send cookies in response for mobile requests.
    const isMobile = authUtil.isMobile(c);
    return cors({
      origin: isMobile ? "" : ENVIRONMENT === "local" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : "", // should be the domain you're hosting your website on
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "x-platform",
        "x-client-id",
        "x-request-id",
        "x-client-attestation",
      ],
      allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      credentials: true,
    })(c, next);
  });

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

  app.use("/api/*", dbMiddleware);

  app.post("/api/refresh", async (c: Context<typeConfig.Context>) => {
    const refreshToken = getCookie(c, authUtil.REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      throw new errorConfig.Unauthorized("No refresh token provided");
    }
    if (refreshToken.length !== 128) {
      throw new errorConfig.Unauthorized("Invalid refresh token");
    }
    const accessToken = await authUtil.refreshAccessToken(c, refreshToken);
    const { scope } = jwtService.decodeToken(accessToken);

    if (authUtil.isMobile(c)) {
      return c.json({
        success: true,
        data: {
          accessToken,
          scope,
        },
      });
    } else {
      const origin = c.req.header("Origin");
      const expiration = jwtService.getTokenExpiration(accessToken);
      setCookie(c, authUtil.ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: origin?.includes("localhost") && env(c).ENVIRONMENT !== "prod" ? false : true,
        sameSite: "Lax",
        path: "/",
        maxAge: expiration - Date.now(),
      });
      return c.json({
        success: true,
        data: {
          scope,
          expires: expiration,
        },
      });
    }
  });

  app.route("/api", identityRoutes);
  app.route("/api", appAttestRoutes);
  app.route("/api", protectedUnverifiedRoutes);
  app.route("/api", protectedRoutes);

  return app;
};
