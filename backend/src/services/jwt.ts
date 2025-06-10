import * as jose from "jose";
import { typeConfig } from "@configs";
import { Context } from "hono";

const REVOKED_TOKENS_PREFIX = "revoked_token:";

export const signToken = async (secret: string, payload: typeConfig.AccessTokenBody): Promise<string> => {
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

  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await c.env.KV.put(`${REVOKED_TOKENS_PREFIX}${token}`, "revoked", { expirationTtl: ttl });
  }
};
