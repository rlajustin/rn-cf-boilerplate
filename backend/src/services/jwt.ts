import * as jose from "jose";
import { typeConfig } from "@configs";
import { Context } from "hono";

const REVOKED_TOKENS_PREFIX = "revoked_token:";

export const decodeToken = (token: string): typeConfig.AccessTokenBody => {
  return jose.decodeJwt(token) as typeConfig.AccessTokenBody;
};

export const signToken = async (secret: string, payload: typeConfig.AccessTokenBody): Promise<string> => {
  const key = new TextEncoder().encode(secret);

  return await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(key);
};

export const signGenericToken = async (secret: string, payload: Record<string, unknown>): Promise<string> => {
  const key = new TextEncoder().encode(secret);
  return await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(key);
};

export const verifyToken = async (
  secret: string,
  token: string,
  c?: Context<typeConfig.Context>
): Promise<typeConfig.AccessTokenBody> => {
  const key = new TextEncoder().encode(secret);

  // First check if token is revoked
  if (c?.env.KV) {
    const isRevoked = await c.env.KV.get(`${REVOKED_TOKENS_PREFIX}${token}`);
    if (isRevoked) {
      throw new Error("Token has been revoked");
    }
  }

  const { payload } = await jose.jwtVerify(token, key);
  return payload as typeConfig.AccessTokenBody;
};

export const revokeToken = async (c: Context<typeConfig.Context>, token: string): Promise<void> => {
  // Store the token in KV with an expiration
  // We only need to store revoked tokens until their natural expiration
  const decoded = jose.decodeJwt(token);
  const exp = decoded.exp;

  if (!exp) {
    throw new Error("Token has no expiration");
  }

  const ttl = exp - Date.now();
  if (ttl > 0) {
    await c.env.KV.put(`${REVOKED_TOKENS_PREFIX}${token}`, "revoked", { expirationTtl: ttl / 1000 });
  }
};

/**
 * Safely extracts expiration from JWT token without verification
 * This is safe because we're only reading the payload, not trusting it
 */
export const getTokenExpiration = (token: string): number => {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded.exp || typeof decoded.exp !== "number") {
      throw new Error("Token has no valid expiration");
    }
    return decoded.exp;
  } catch (error) {
    throw new Error("Invalid token format");
  }
};
