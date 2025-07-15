import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { VerifyEmailRoute } from "./verify-email";
import { DeleteAccountRoute } from "./delete-account";
import { ResendEmailVerifyRoute } from "./resend-email-verify";
import { LogoutRoute } from "./logout";

const protectedUnverifiedRoutes = new Hono<typeConfig.Context>();

const routes = [VerifyEmailRoute, ResendEmailVerifyRoute, DeleteAccountRoute, LogoutRoute];

mountRoutes(routes, protectedUnverifiedRoutes);

export default protectedUnverifiedRoutes;
