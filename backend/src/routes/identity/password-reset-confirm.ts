import { typeConfig, errorConfig } from "@configs";
import { userSchema } from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { kvService } from "@services";
import * as bcrypt from "bcryptjs";
import { HandlerFunction, Route } from "@routes/utils";
import { env } from "hono/adapter";
import { jwtService } from "@services";
import { cryptoUtil } from "@utils";

const postPasswordResetConfirm: HandlerFunction<"PASSWORD_RESET_CONFIRM"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema: { users: userSchema.users } });
  const userTable = userSchema.users;

  const { JWT_SECRET } = env(c);
  let payload: Record<string, unknown>;
  try {
    payload = (await jwtService.verifyToken(JWT_SECRET, dto.token)) as Record<string, unknown>;
  } catch {
    throw new errorConfig.Unauthorized("Invalid or expired token");
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now) {
    throw new errorConfig.Unauthorized("Token expired");
  }

  // Decrypt user id
  if (typeof payload.sub !== "string") {
    throw new errorConfig.Unauthorized("Invalid or expired token");
  }
  let userId: string;
  try {
    userId = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
  } catch {
    throw new errorConfig.Unauthorized("Invalid or expired token");
  }

  // Find user by decrypted userId
  // const user = await db.query.users.findFirst({ where: eq(userTable.userId, userId) });
  // if (!user) {
  //   throw new errorConfig.Unauthorized("Invalid or expired token");
  // }

  // @dev THIS NEEDS TO BE HASHED ON THE FRONTEND TOO
  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

  // Update password
  await db
    .update(userTable)
    .set({ password: hashedPassword, isEmailVerified: true })
    .where(eq(userTable.userId, userId));

  return { success: true, message: "Password has been reset successfully" };
};

export const PasswordResetConfirmRoute: Route<"PASSWORD_RESET_CONFIRM"> = {
  key: "PASSWORD_RESET_CONFIRM",
  handler: postPasswordResetConfirm,
};
