import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { kvService } from "@services";
import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";

const postVerifyEmail: HandlerFunction<"VERIFY_EMAIL"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema: { users: schema.users } });
  const kv = c.env.KV;
  const authenticatedUser = authUtil.getAuthenticatedUser(c);
  const code = await kvService.getEmailVerificationCode(kv, authenticatedUser.sub);
  if (!code) {
    return {
      success: false,
      message: "Invalid or expired email verification code",
    };
  }

  if (code !== dto.code) {
    return {
      success: false,
      message: "Invalid or expired email verification code",
    };
  }
  let returnMessage;
  if (authenticatedUser.scope === "user") {
    console.log(authenticatedUser.sub);
    const updatedUser = await db
      .update(schema.users)
      .set({ email: dto.newEmail })
      .where(eq(schema.users.userId, authenticatedUser.sub))
      .returning();

    if (!updatedUser)
      returnMessage = {
        success: false,
        newEmail: dto.newEmail,
        message: "Failed to update email, please try again",
      };

    returnMessage = {
      success: true,
      newEmail: dto.newEmail,
      message: "Email successfully changed. Please log in again.",
    };
  } else {
    const updatedUser = await db
      .update(schema.users)
      .set({
        scope: "user",
      })
      .where(eq(schema.users.userId, authenticatedUser.sub));
    if (!updatedUser)
      returnMessage = {
        success: false,
        message: "Failed to verify email, please try again",
      };

    returnMessage = {
      success: true,
      message: "Email verified successfully. Please log in again.",
    };
  }

  await kvService.deleteEmailVerificationCode(kv, authenticatedUser.sub);
  return returnMessage;
};

export const VerifyEmailRoute: Route<"VERIFY_EMAIL"> = {
  key: "VERIFY_EMAIL",
  handler: postVerifyEmail,
};
