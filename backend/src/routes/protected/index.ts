import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { ExampleRoute } from "./example";
import { DeleteAccountRoute } from "./delete-account";
import { ChangeEmailRequestRoute } from "./change-email-request";

const protectedRoutes = new Hono<typeConfig.Context>();

const routes = [ExampleRoute, DeleteAccountRoute, ChangeEmailRequestRoute];

mountRoutes(routes, protectedRoutes);

export default protectedRoutes;
