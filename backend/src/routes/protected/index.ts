import { Hono } from "hono";
import { typeConfig } from "@configs";
import { getAuthMiddleware } from "@middleware";

import { ExampleRoute } from "./example";
import { mountRoutes } from "@routes/utils";

const protectedRoutes = new Hono<typeConfig.Context>();
protectedRoutes.use("*", getAuthMiddleware(true));

const routes = [ExampleRoute];

mountRoutes(routes, protectedRoutes);

export default protectedRoutes;
