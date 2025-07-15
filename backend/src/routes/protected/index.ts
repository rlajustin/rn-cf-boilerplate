import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { ExampleRoute } from "./example";
import { ChangeEmailRequestRoute } from "./change-email-request";

const protectedRoutes = new Hono<typeConfig.Context>();

const routes = [ExampleRoute, ChangeEmailRequestRoute];

mountRoutes(routes, protectedRoutes);

export default protectedRoutes;
