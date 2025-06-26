import { errorConfig } from "@configs";
import { userSchema } from "../../schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { kvService } from "@services";
import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";

const postVerifyEmail: HandlerFunction<"VERIFY_EMAIL"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema: { users: userSchema.users } });
  const kv = c.env.KV;
  const userTable = userSchema.users;
  const authenticatedUser = authUtil.getAuthenticatedUser(c);

  const code = await kvService.getEmailVerificationCode(kv, authenticatedUser.sub);
  if (!code) {
    throw new errorConfig.Unauthorized("Invalid email verification code");
  }

  if (code !== dto.code) {
    throw new errorConfig.Unauthorized("Invalid email verification code");
  }

  await db
    .update(userTable)
    .set({
      isEmailVerified: true,
    })
    .where(eq(userTable.userId, authenticatedUser.sub));

  await kvService.deleteEmailVerificationCode(kv, authenticatedUser.sub);

  return { success: true, message: "Email verified successfully" };
};

export const VerifyEmailRoute: Route<"VERIFY_EMAIL"> = {
  key: "VERIFY_EMAIL",
  handler: postVerifyEmail,
};
