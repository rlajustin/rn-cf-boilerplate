import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";

import { RegisterAccountRoute } from "./register-account";
import { LoginRoute } from "./login";
import { PasswordResetConfirmRoute } from "./password-reset-confirm";
import { PasswordResetRequestRoute } from "./password-reset-request";
import { PasswordResetValidateRoute } from "./password-reset-validate";

const identityRoutes = new Hono<typeConfig.Context>();

const routes = [
  RegisterAccountRoute,
  LoginRoute,
  PasswordResetConfirmRoute,
  PasswordResetRequestRoute,
  PasswordResetValidateRoute,
];

mountRoutes(routes, identityRoutes);

export default identityRoutes;
