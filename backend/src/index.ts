import { Hono } from "hono";
import { loadRouters } from "@router";
import { typeConfig } from "@configs";

const app = new Hono<typeConfig.Context>();
const appWithRouters = loadRouters(app);

export default appWithRouters;
