import { Hono } from "hono";
import { typeConfig } from "@configs";
import exampleRoutes from "./example";
import { authenticate } from "@middleware";

const protectedRoutes = new Hono<typeConfig.Context>();
protectedRoutes.use("*", authenticate);

protectedRoutes.route("/", exampleRoutes);
// add more routes here

export default protectedRoutes;
