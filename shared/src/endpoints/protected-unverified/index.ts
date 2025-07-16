import { LogoutEndpoint } from "./logout";
import { ResendVerifyEmailEndpoint } from "./resend-verify-email";
import { VerifyEmailEndpoint } from "./verify-email";
import { DeleteAccountEndpoint } from "./delete-account";

export const ProtectedUnverifiedEndpoints = {
  RESEND_VERIFY_EMAIL: ResendVerifyEmailEndpoint,
  DELETE_ACCOUNT: DeleteAccountEndpoint,
  VERIFY_EMAIL: VerifyEmailEndpoint,
  LOGOUT: LogoutEndpoint,
};
