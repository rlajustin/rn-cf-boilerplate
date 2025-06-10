import { typeConfig, errorConfig } from "@configs";
import { userSchema } from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { kvService, jwtService } from "@services";
import * as bcrypt from "bcryptjs";
import { env } from "hono/adapter";
import { setAuthToken } from "@middleware";
import { HandlerFunction, Route } from "@routes/utils";
import { cryptoUtil } from "@utils";

const postLogin: HandlerFunction<"LOGIN"> = async (c, dto) => {
  const failedAttempts = await kvService.getFailedLoginAttempts(c.env.KV, dto.email);
  if (failedAttempts >= 5) {
    throw new errorConfig.Forbidden("Account locked due to too many failed attempts. Try again later.");
  }

  const db = drizzle(c.env.DB, { schema: { users: userSchema.users } });
  const userTable = userSchema.users;

  const user = await db.query.users.findFirst({
    where: eq(userTable.email, dto.email),
  });

  if (!user) {
    await kvService.incrementFailedLoginAttempts(c.env.KV, dto.email);
    throw new errorConfig.Unauthorized("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(dto.password, user.password);
  if (!isValidPassword) {
    await kvService.incrementFailedLoginAttempts(c.env.KV, dto.email);
    throw new errorConfig.Unauthorized("Invalid credentials");
  }

  await kvService.resetFailedLoginAttempts(c.env.KV, dto.email);

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60 * 24; // 24 hours
  const expiresOn = now + expiresIn;

  const { JWT_SECRET } = env(c);
  const encryptedUserId = cryptoUtil.encryptString(user.userId, JWT_SECRET);
  const encryptedEmail = cryptoUtil.encryptString(user.email, JWT_SECRET);

  const tokenBody: typeConfig.AccessTokenBody = {
    sub: encryptedUserId,
    email: encryptedEmail,
    scope: user.isEmailVerified ? "user" : "unverified",
    iat: now,
    exp: expiresOn,
  };

  const accessToken = await jwtService.signToken(JWT_SECRET, tokenBody);

  return setAuthToken(c, accessToken);
};

export const LoginRoute: Route<"LOGIN"> = {
  key: "LOGIN",
  handler: postLogin,
};
