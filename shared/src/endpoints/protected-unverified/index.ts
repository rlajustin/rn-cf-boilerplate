import { ResendVerifyEmailEndpoint } from "./resend-verify-email";
import { VerifyEmailEndpoint } from "./verify-email";

export const ProtectedUnverifiedEndpoints = {
  RESEND_VERIFY_EMAIL: ResendVerifyEmailEndpoint,
  VERIFY_EMAIL: VerifyEmailEndpoint,
};
