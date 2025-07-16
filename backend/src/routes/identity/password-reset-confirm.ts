import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as bcrypt from "bcryptjs";
import { HandlerFunction, Route } from "@routes/utils";
import { env } from "hono/adapter";
import { jwtService } from "@services";
import { cryptoUtil } from "@utils";

const postPasswordResetConfirm: HandlerFunction<"PASSWORD_RESET_CONFIRM"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema });

  const { JWT_SECRET } = env(c);
  let payload: Record<string, unknown>;
  try {
    payload = (await jwtService.verifyToken(JWT_SECRET, dto.token)) as Record<string, unknown>;
  } catch {
    return { success: true, message: "Invalid or expired link" };
  }

  // Check expiration
  const now = Date.now();
  if (typeof payload.exp !== "number" || payload.exp < now) {
    return { success: true, message: "Invalid or expired link" };
  }

  // Decrypt user id
  if (typeof payload.sub !== "string") {
    return { success: true, message: "Invalid or expired link" };
  }
  let userId: string;
  try {
    userId = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
  } catch {
    return { success: true, message: "Invalid or expired link" };
  }

  // Find user by decrypted userId
  // const user = await db.query.users.findFirst({ where: eq(userTable.userId, userId) });
  // if (!user) {
  //   return { success: true, message: "Invalid or expired link" };
  // }

  // @dev THIS NEEDS TO BE HASHED ON THE FRONTEND TOO
  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

  // Update password
  await db.update(schema.users).set({ password: hashedPassword, scope: "user" }).where(eq(schema.users.userId, userId));

  return { success: true, message: "Password has been reset successfully" };
};

export const PasswordResetConfirmRoute: Route<"PASSWORD_RESET_CONFIRM"> = {
  key: "PASSWORD_RESET_CONFIRM",
  handler: postPasswordResetConfirm,
};
