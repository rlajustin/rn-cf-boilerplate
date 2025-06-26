import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";
import { getAuthMiddleware } from "@middleware";

import { VerifyEmailRoute } from "./verify-email";
import { ResendEmailVerifyRoute } from "./resend-email-verify";

const protectedUnverifiedRoutes = new Hono<typeConfig.Context>();
protectedUnverifiedRoutes.use("*", getAuthMiddleware(false));

const routes = [VerifyEmailRoute, ResendEmailVerifyRoute];

mountRoutes(routes, protectedUnverifiedRoutes);

export default protectedUnverifiedRoutes;
