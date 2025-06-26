import { RegisterAccountEndpoint } from "./register-account";
import { LoginEndpoint } from "./login";
import { PasswordResetRequestEndpoint } from "./password-reset-request";
import { PasswordResetValidateEndpoint } from "./password-reset-validate";
import { PasswordResetConfirmEndpoint } from "./password-reset-confirm";

export const IdentityEndpoints = {
  REGISTER_ACCOUNT: RegisterAccountEndpoint,
  LOGIN: LoginEndpoint,
  PASSWORD_RESET_REQUEST: PasswordResetRequestEndpoint,
  PASSWORD_RESET_VALIDATE: PasswordResetValidateEndpoint,
  PASSWORD_RESET_CONFIRM: PasswordResetConfirmEndpoint,
};
