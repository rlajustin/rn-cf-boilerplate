import { Hono } from "hono";
import { typeConfig } from "@configs";
import { handleAuth } from "@middleware";
import { mountRoutes } from "@routes/utils";

import { ExampleRoute } from "./example";
import { DeleteAccountRoute } from "./delete-account";
import { ChangeEmailRequestRoute } from "./change-email-request";

const protectedRoutes = new Hono<typeConfig.Context>();
// handles auth and rate limiting
protectedRoutes.use("*", handleAuth(true));

const routes = [ExampleRoute, DeleteAccountRoute, ChangeEmailRequestRoute];

mountRoutes(routes, protectedRoutes);

export default protectedRoutes;
