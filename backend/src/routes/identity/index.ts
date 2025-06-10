import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { RegisterAccountRoute } from "./register-account";
import { VerifyEmailRoute } from "./verify-email";
import { LoginRoute } from "./login";

const identityRoutes = new Hono<typeConfig.Context>();

const routes = [RegisterAccountRoute, VerifyEmailRoute, LoginRoute];

mountRoutes(routes, identityRoutes);

export default identityRoutes;
