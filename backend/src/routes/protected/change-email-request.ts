import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";
import { env } from "hono/adapter";
import { eq } from "drizzle-orm";
import * as schema from "@schema";
import { emailService } from "@services";

const postChangeEmailRequest: HandlerFunction<"CHANGE_EMAIL_REQUEST"> = async (c, dto) => {
  // Get the authenticated user's information using helper functions
  const db = c.get("db");
  const authenticatedUser = authUtil.getAuthenticatedUser(c);

  const [foundUser] = await db.select().from(schema.users).where(eq(schema.users.email, dto.newEmail)).limit(1);
  if (!foundUser) {
    await emailService.handleSendEmailVerificationCode(c, dto.newEmail, authenticatedUser.sub);
  }

  return {
    success: true,
    newEmail: dto.newEmail,
    message: `Email verification code will be sent if user doesn't already exist.`,
  };
};

export const ChangeEmailRequestRoute: Route<"CHANGE_EMAIL_REQUEST"> = {
  key: "CHANGE_EMAIL_REQUEST",
  handler: postChangeEmailRequest,
};
