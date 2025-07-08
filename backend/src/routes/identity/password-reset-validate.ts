import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HandlerFunction, Route } from "@routes/utils";
import { env } from "hono/adapter";
import { cryptoUtil } from "@utils";
import { jwtService } from "@services";
import { errorConfig } from "@configs";

const getPasswordResetValidate: HandlerFunction<"PASSWORD_RESET_VALIDATE"> = async (c, query) => {
  const db = drizzle(c.env.DB, { schema });

  const { JWT_SECRET } = env(c);
  const token = query["token"];
  if (!token || typeof token !== "string") {
    throw new errorConfig.Forbidden();
  }

  // Verify and decode the JWT
  let payload: Record<string, unknown>;
  try {
    payload = (await jwtService.verifyToken(JWT_SECRET, token)) as Record<string, unknown>;
  } catch {
    throw new errorConfig.Forbidden();
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now) {
    throw new errorConfig.Unauthorized();
  }

  // Decrypt user id
  if (typeof payload.sub !== "string") {
    throw new errorConfig.BadRequest();
  }
  let userId: string;
  try {
    userId = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
  } catch {
    throw new errorConfig.Forbidden();
  }

  // Find user by decrypted userId
  const user = await db.select().from(schema.users).where(eq(schema.users.userId, userId));
  if (!user) {
    throw new errorConfig.Unauthorized();
  }

  return { valid: true };
};

export const PasswordResetValidateRoute: Route<"PASSWORD_RESET_VALIDATE"> = {
  key: "PASSWORD_RESET_VALIDATE",
  handler: getPasswordResetValidate,
};
