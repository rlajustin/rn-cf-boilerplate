import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { ExampleRoute } from "./example";

const exampleRoutes = new Hono<typeConfig.Context>();

const routes = [ExampleRoute];

mountRoutes(routes, exampleRoutes);

export default exampleRoutes;
