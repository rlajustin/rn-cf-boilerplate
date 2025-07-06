import { errorConfig } from "@configs";
import { userSchema } from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { emailService, jwtService, kvService } from "@services";
import { HandlerFunction, Route } from "@routes/utils";
import { EmailValidator } from "@utils/email-validator";
import { cryptoUtil } from "@utils";
import { env } from "hono/adapter";

const postPasswordResetRequest: HandlerFunction<"PASSWORD_RESET_REQUEST"> = async (c, dto) => {
  const { KV } = env(c);
  const db = drizzle(c.env.DB, { schema: { users: userSchema.users } });
  const userTable = userSchema.users;

  try {
    EmailValidator.validate(dto.email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new errorConfig.BadRequest(error.message);
    }
    throw new errorConfig.BadRequest("Invalid email");
  }

  const user = await db.query.users.findFirst({
    where: eq(userTable.email, dto.email),
  });

  if (user) {
    // Always return success is good practice probably
    const kvRequests = await kvService.getPasswordResetAttempts(KV, dto.email);
    if (kvRequests > 3) {
      throw new errorConfig.BadRequest("Try again in 24 hours.");
    }
    await kvService.setPasswordResetAttempts(KV, dto.email, kvRequests + 1);
    // Generate a JWT token for password reset (expires in 24 hours)
    const { JWT_SECRET } = env(c);
    const encryptedUserId = cryptoUtil.encryptString(user.userId, JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24; // 24 hours
    const payload = { sub: encryptedUserId, email: user.email, exp };
    const token = await jwtService.signGenericToken(JWT_SECRET, payload);

    // Send password reset email using the service
    await emailService.sendPasswordResetEmail(c, user, token);
  }

  return { success: true, message: "If the email exists, a reset link will be sent." };
};

export const PasswordResetRequestRoute: Route<"PASSWORD_RESET_REQUEST"> = {
  key: "PASSWORD_RESET_REQUEST",
  handler: postPasswordResetRequest,
};
