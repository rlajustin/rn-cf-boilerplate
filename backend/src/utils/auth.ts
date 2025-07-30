import { Context } from "hono";
import { errorConfig, typeConfig } from "@configs";
import { jwtService } from "@services";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { cryptoUtil } from "@utils";
import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { hashString } from "@utils/crypto";
import { AuthScopeType } from "shared";

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

/**
 * Helper function to get the authenticated user from the context
 * This function should be used in protected routes after the auth middleware
 */
export const getAuthenticatedUser = (c: Context<typeConfig.Context>): typeConfig.AccessTokenBody => {
  const accessTokenBody = c.get("access_token_body");
  if (!accessTokenBody) {
    throw new errorConfig.Unauthorized("User not authenticated");
  }
  return accessTokenBody;
};

export const generateAccessToken = async (c: Context<typeConfig.Context>, user: schema.User): Promise<string> => {
  const now = Date.now();
  const expiresIn = 1000 * 60 * 15; // 15 minutes
  const expiresOn = now + expiresIn;

  const { JWT_SECRET } = env(c);
  const encryptedUserId = cryptoUtil.encryptString(user.userId, JWT_SECRET);

  const tokenBody: typeConfig.AccessTokenBody = {
    sub: encryptedUserId,
    email: user.email,
    scope: user.scope,
    iat: now,
    exp: expiresOn,
  };

  return await jwtService.signToken(JWT_SECRET, tokenBody);
};

export const refreshAccessToken = async (c: Context<typeConfig.Context>, refreshToken: string): Promise<string> => {
  const db = c.get("db");

  const hashedToken = cryptoUtil.hashString(refreshToken);

  const [result] = await db
    .select({
      token: schema.refreshTokens,
      user: schema.users,
    })
    .from(schema.refreshTokens)
    .innerJoin(schema.users, eq(schema.refreshTokens.userId, schema.users.userId))
    .where(eq(schema.refreshTokens.token, hashedToken))
    .limit(1);

  if (!result) throw new errorConfig.Unauthorized("Invalid refresh token");

  const { token, user } = result;
  if (new Date(token.expiresAt).getTime() < Date.now()) {
    // custom error for this case
    throw new HTTPException(418, { message: "Credentials expired" });
  }

  const accessToken = await generateAccessToken(c, user);

  return accessToken;
};

/**
 * Generates a secure random refresh token, stores its hash in the DB, and returns the raw token.
 */
export const generateAndStoreRefreshToken = async (
  db: typeConfig.DrizzleDB,
  userId: string
): Promise<{ refreshToken: string; refreshTokenExpires: number }> => {
  const refreshTokenRaw = randomBytes(64).toString("hex");
  const refreshTokenHash = hashString(refreshTokenRaw);
  const refreshTokenExpires = Date.now() + 1000 * 60 * 60 * 24 * 400;

  const [res] = await db
    .insert(schema.refreshTokens)
    .values({
      token: refreshTokenHash,
      userId,
      expiresAt: new Date(refreshTokenExpires),
    })
    .returning();
  if (!res) throw new Error("Failed to generate tokens");

  return {
    refreshToken: refreshTokenRaw,
    refreshTokenExpires,
  };
};

export const isMobile = (c: Context<typeConfig.Context>): boolean => {
  const platform = c.req.header("x-platform");
  return platform === "mobile";
};

export const allowUserAccess = (requiredScope: AuthScopeType, userScope: AuthScopeType): boolean => {
  if (userScope === "admin") return true;
  else if (requiredScope === null) return true;
  else if (requiredScope === "unverified") {
    if (userScope) return true;
  } else if (requiredScope === "user") {
    if (userScope === "user") return true;
  }
  return false;
};
