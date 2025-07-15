import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HandlerFunction, Route } from "@routes/utils";
import { env } from "hono/adapter";
import { cryptoUtil } from "@utils";
import { jwtService } from "@services";

const getPasswordResetValidate: HandlerFunction<"PASSWORD_RESET_VALIDATE"> = async (c, query) => {
  const db = drizzle(c.env.DB, { schema });

  const { JWT_SECRET } = env(c);
  const token = query["token"];
  if (!token || typeof token !== "string") {
    return { success: false, message: "Link invalid, please request a new one" };
  }

  // Verify and decode the JWT
  let payload: Record<string, unknown>;
  try {
    payload = (await jwtService.verifyToken(JWT_SECRET, token)) as Record<string, unknown>;
  } catch {
    return { success: false, message: "Link invalid, please request a new one" };
  }

  // Check expiration
  const now = Date.now();
  if (typeof payload.exp !== "number" || payload.exp < now) {
    return { success: false, message: "Link invalid, please request a new one" };
  }

  // Decrypt user id
  if (typeof payload.sub !== "string") {
    return { success: false, message: "Link invalid, please request a new one" };
  }
  let userId: string;
  try {
    userId = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
  } catch {
    return { success: false, message: "Link invalid, please request a new one" };
  }

  // Find user by decrypted userId
  const user = await db.select().from(schema.users).where(eq(schema.users.userId, userId));
  if (!user) {
    return { success: false, message: "Link invalid, please request a new one" };
  }

  return { success: true };
};

export const PasswordResetValidateRoute: Route<"PASSWORD_RESET_VALIDATE"> = {
  key: "PASSWORD_RESET_VALIDATE",
  handler: getPasswordResetValidate,
};
