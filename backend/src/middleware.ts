import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCookie, setCookie } from "hono/cookie";
import { env } from "hono/adapter";
import { verifyToken, revokeToken } from "@services/jwt";
import { errorConfig, typeConfig } from "@configs";
import { kvService } from "@services";
import { cryptoUtil } from "@utils";
import { verifyAssertion } from "node-app-attest";
import stringify from "json-stable-stringify";

const AUTH_COOKIE_NAME = "auth_token";
const BEARER_PREFIX = "Bearer ";

export interface AuthContext extends Context {
  user: typeConfig.AccessTokenBody;
}

/**
 * Sets the JWT token as an HTTP-only cookie for web clients
 * or returns it in the response body for mobile clients
 */
export const setAuthToken = (c: Context, token: string) => {
  const platform = c.req.header("x-platform");
  const isMobile = platform === "mobile";

  // Parse token to get expiration
  const tokenData = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

  if (isMobile) {
    return {
      success: true,
      data: {
        access_token: token,
        token_type: "Bearer",
        expires: tokenData.exp,
      },
    };
  }

  // For web clients, set HTTP-only cookie
  setCookie(c, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: Math.ceil(tokenData.exp - Date.now() / 1000),
  });

  return {
    success: true,
    data: {
      expires: tokenData.exp,
    },
  };
};

/**
 * Removes the authentication token and revokes it
 */
export const clearAuthToken = async (c: Context<typeConfig.Context>) => {
  // Get the token before clearing it
  const token = getCookie(c, AUTH_COOKIE_NAME);

  // Clear the cookie
  setCookie(c, AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 0,
  });

  // If there was a token, revoke it
  if (token) {
    await revokeToken(c, token);
  }
};

/**
 * Authentication middleware that verifies JWT tokens from either:
 * - HTTP-only cookie (web clients)
 * - Authorization Bearer header (mobile clients)
 */
export const authenticate = async (c: Context<typeConfig.Context>, next: Next) => {
  try {
    const { JWT_SECRET } = env(c);
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    let token: string | undefined;

    // Check Authorization header first (mobile)
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith(BEARER_PREFIX)) {
      token = authHeader.slice(BEARER_PREFIX.length);
    }

    // If no Authorization header, check for cookie (web)
    if (!token) {
      token = getCookie(c, AUTH_COOKIE_NAME);
    }

    if (!token) {
      throw new errorConfig.Unauthorized("Authentication required");
    }

    // Verify and decode the token, including revocation check
    const payload: typeConfig.AccessTokenBody = await verifyToken(JWT_SECRET, token, c);
    if (payload.scope === "unverified") {
      throw new errorConfig.Unauthorized("Unverified user");
    }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new errorConfig.Unauthorized("Token expired");
    }
    payload.sub = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
    payload.email = cryptoUtil.decryptString(payload.email, JWT_SECRET);
    // Add user data to context
    c.set("access_token_body", payload);

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new errorConfig.Unauthorized("Invalid authentication token");
  }
};

/**
 * Optional authentication middleware that doesn't require authentication
 * but will still verify and decode the token if present
 */
export const optionalAuthenticate = async (c: Context, next: Next) => {
  try {
    const { JWT_SECRET } = env(c);
    if (!JWT_SECRET) {
      await next();
      return;
    }

    let token: string | undefined;

    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith(BEARER_PREFIX)) {
      token = authHeader.slice(BEARER_PREFIX.length);
    }

    if (!token) {
      token = getCookie(c, AUTH_COOKIE_NAME);
    }

    if (!token) {
      await next();
      return;
    }

    const payload = await verifyToken(JWT_SECRET, token);
    (c as AuthContext).user = payload;

    await next();
  } catch (error) {
    // If token verification fails, continue without user data
    await next();
  }
};

// Middleware function that Routers can use to check the integrity of the client
// invoking some operation. If the integrity cannot be verified, this middleware will
// fail the request. Otherwise it lets the request run.
export const checkAppAttest = async (c: Context<typeConfig.Context>, next: Next) => {
  const { ENVIRONMENT } = env(c);
  if (ENVIRONMENT === "local") await next();
  else {
    const clientId = c.req.header("x-client-id");
    const requestId = c.req.header("x-request-id");
    if (!clientId || !requestId) {
      throw new errorConfig.BadRequest("Client or request ID not found");
    }

    const clientAttestationBase64 = c.req.header("x-client-attestation");
    if (!clientAttestationBase64) {
      throw new errorConfig.BadRequest("Missing client-attestation");
    }

    const nonceCheckPass = await performNonceChecks(c, requestId, clientId, clientAttestationBase64);
    if (!nonceCheckPass) {
      throw new errorConfig.BadRequest("Nonce check failed");
    }

    const appAttestKey = await kvService.getAppAttestKey(c.env.KV, clientId);
    if (!appAttestKey) {
      throw new errorConfig.BadRequest("Unknown clientId (no appAttestKey found)!");
    }
    const body = stringify(await c.req.json());
    if (!body) {
      throw new errorConfig.BadRequest("Unable to parse request body");
    }
    const bundleIdentifier = process.env.APP_BUNDLE_ID;
    const teamIdentifier = process.env.TEAM_ID;
    if (!bundleIdentifier || !teamIdentifier) throw new Error("Unable to find app data");

    const clientDataHash = await cryptoUtil.getSHA256(Buffer.from(body));
    const { signCount } = verifyAssertion({
      assertion: clientDataHash,
      payload: body,
      publicKey: appAttestKey,
      bundleIdentifier,
      teamIdentifier,
      signCount: 0,
    });
    if (signCount !== 0) {
      throw new errorConfig.BadRequest(`Could not verify request (signCount issue)!`);
    }
    await kvService.deleteAttestationNonce(c.env.KV, clientId, requestId);
    console.log("Successfully verified client-attestation");

    await next();
  }
};

async function performNonceChecks(
  c: Context<typeConfig.Context>,
  requestId: string,
  clientId: string,
  clientNonce: string
): Promise<boolean> {
  const nonce = await kvService.getAttestationNonce(c.env.KV, clientId, requestId);
  if (!nonce) {
    console.warn("No nonce found for clientId/reqiuestId");
    throw new errorConfig.BadRequest("Nonce not found for request");
  }

  if (typeof clientNonce !== "string") {
    console.warn("No challenge provided in request body!");
    throw new errorConfig.BadRequest("Challenge not included in request body");
  }
  if (clientNonce !== nonce) {
    console.warn("Client provided nonce does not match!");
    throw new errorConfig.Unauthorized("Client provided nonce does not match!");
  }
  return true;
}
