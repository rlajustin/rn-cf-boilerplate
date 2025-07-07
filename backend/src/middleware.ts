import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { env } from "hono/adapter";
import { errorConfig, typeConfig } from "@configs";
import { kvService, jwtService } from "@services";
import { cryptoUtil, authUtil, requestUtil } from "@utils";
import { verifyAssertion } from "node-app-attest";
import stringify from "json-stable-stringify";
import { WeightRange } from "shared/src/types";
import { AllEndpoints } from "shared";

const BEARER_PREFIX = "Bearer ";

type KeyFunction = (c: Context<typeConfig.Context>) => string;

const baseKeyFunc: KeyFunction = (c) => {
  const ip = requestUtil.getRequestIP(c);
  if (!ip) throw new errorConfig.Forbidden();
  return ip;
};

export const rateLimit = async ({
  c,
  next,
  authed,
  keyValue,
  keyFunc = baseKeyFunc,
  weight = 1,
}: {
  c: Context<typeConfig.Context>;
  next: Next;
  authed: boolean;
  keyValue?: string;
  keyFunc?: KeyFunction;
  weight?: WeightRange;
}) => {
  const RATE_LIMITER = authed ? env(c).AUTHED_RATE_LIMITER : env(c).BASE_RATE_LIMITER;
  let key = keyValue ? keyValue : keyFunc(c);
  if (!key) {
    throw new errorConfig.TooManyRequests();
  }
  const arr = await Promise.all(Array.from({ length: weight }, () => RATE_LIMITER.limit({ key }))); // currently this API has no way to incr by N
  if (arr.some((res) => !res.success)) throw new errorConfig.TooManyRequests();
  await next();
};

export const handleAuth = (requireUserVerified: boolean) => {
  const authenticate = async (c: Context<typeConfig.Context>, next: Next) => {
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
      token = getCookie(c, authUtil.AUTH_COOKIE_NAME);
    }

    if (!token) {
      throw new errorConfig.Unauthorized("Authentication required");
    }

    // Verify and decode the token, including revocation check
    const payload: typeConfig.AccessTokenBody = await jwtService.verifyToken(JWT_SECRET, token, c);

    // Check if user verification is required
    if (requireUserVerified && payload.scope === "unverified") {
      throw new errorConfig.Unauthorized("Unverified user");
    }

    // Decrypt sensitive data
    try {
      payload.sub = cryptoUtil.decryptString(payload.sub, JWT_SECRET);
    } catch (decryptError) {
      throw new errorConfig.Unauthorized("Invalid token data");
    }

    // Add user data to context
    c.set("access_token_body", payload);

    await rateLimit({ c, next, authed: true, keyValue: payload.sub });
  };
  return authenticate;
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
