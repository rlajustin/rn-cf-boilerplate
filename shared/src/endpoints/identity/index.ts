import { RegisterAccountEndpoint } from "./register-account";
import { VerifyEmailEndpoint } from "./verify-email";
import { LoginEndpoint } from "./login";

export const IdentityEndpoints = {
  REGISTER_ACCOUNT: RegisterAccountEndpoint,
  VERIFY_EMAIL: VerifyEmailEndpoint,
  LOGIN: LoginEndpoint,
};
