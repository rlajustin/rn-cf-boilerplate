import { errorConfig } from "@configs";
import { emailService } from "@services";
import { HandlerFunction, Route } from "@routes/utils";
import { EmailValidator } from "@utils/email-validator";
import { authUtil } from "@utils";

const postResendEmailVerify: HandlerFunction<"RESEND_VERIFY_EMAIL"> = async (c, dto) => {
  // Get authenticated user using the helper function
  const authenticatedUser = authUtil.getAuthenticatedUser(c);
  if (authenticatedUser.scope !== "unverified") throw new errorConfig.Forbidden();

  try {
    EmailValidator.validate(authenticatedUser.email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new errorConfig.BadRequest(error.message);
    }
    throw new errorConfig.BadRequest("Invalid email");
  }

  await emailService.handleSendEmailVerificationCode(c, authenticatedUser.email, authenticatedUser.sub);

  return {
    success: true,
    message: "Email verification code sent successfully",
  };
};

export const ResendEmailVerifyRoute: Route<"RESEND_VERIFY_EMAIL"> = {
  key: "RESEND_VERIFY_EMAIL",
  handler: postResendEmailVerify,
};
