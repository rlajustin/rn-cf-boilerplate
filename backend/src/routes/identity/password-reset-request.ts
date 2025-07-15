import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { emailService, jwtService, kvService } from "@services";
import { HandlerFunction, Route } from "@routes/utils";
import { EmailValidator } from "@utils/email-validator";
import { cryptoUtil } from "@utils";
import { env } from "hono/adapter";

const postPasswordResetRequest: HandlerFunction<"PASSWORD_RESET_REQUEST"> = async (c, dto) => {
  const { KV } = env(c);
  const db = drizzle(c.env.DB, { schema });

  try {
    EmailValidator.validate(dto.email);
  } catch (err) {
    return { success: false, message: "Too many requests for this email. Try again in 24 hours." };
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, dto.email));

  if (user) {
    // Always return success is good practice probably
    const kvRequests = await kvService.getPasswordResetAttempts(KV, dto.email);
    if (kvRequests > 3) {
      return { success: false, message: "Too many requests for this email. Try again in 24 hours." };
    }
    await kvService.setPasswordResetAttempts(KV, dto.email, kvRequests + 1);
    // Generate a JWT token for password reset (expires in 24 hours)
    const { JWT_SECRET } = env(c);
    const encryptedUserId = cryptoUtil.encryptString(user.userId, JWT_SECRET);
    const now = Date.now();
    const exp = now + 1000 * 60 * 60 * 24; // 24 hours
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
