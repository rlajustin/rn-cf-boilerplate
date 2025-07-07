import { Hono } from "hono";
import { typeConfig } from "@configs";
import { handleAuth } from "@middleware";

import { ExampleRoute } from "./example";
import { mountRoutes } from "@routes/utils";

const protectedRoutes = new Hono<typeConfig.Context>();
// handles auth and rate limiting
protectedRoutes.use("*", handleAuth(true));

const routes = [ExampleRoute];

mountRoutes(routes, protectedRoutes);

export default protectedRoutes;
