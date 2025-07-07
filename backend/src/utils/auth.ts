import { Context } from "hono";
import { errorConfig, typeConfig } from "@configs";
import { HandlerFunction } from "@routes/utils";
import { jwtService } from "@services";
import { setCookie } from "hono/cookie";
import { env } from "hono/adapter";

export const AUTH_COOKIE_NAME = "auth_token";

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

/**
 * Sets the JWT token as an HTTP-only cookie for web clients
 * or returns it in the response body for mobile clients
 */
export const setAuthToken = (c: Context, token: string): Awaited<ReturnType<HandlerFunction<"LOGIN">>> => {
  const platform = c.req.header("x-platform");
  const isMobile = platform === "mobile";

  // Safely extract expiration from token
  const expiration = jwtService.getTokenExpiration(token);
  const { scope } = jwtService.decodeToken(token);

  if (isMobile) {
    return {
      success: true,
      data: {
        accessToken: token,
        scope,
        expires: expiration,
      },
    };
  }

  // For web clients, set HTTP-only cookie
  setCookie(c, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: origin?.includes("localhost") && env(c).ENVIRONMENT !== "prod" ? false : true,
    sameSite: "Lax",
    path: "/",
    maxAge: Math.ceil(expiration - Date.now() / 1000),
  });

  return {
    success: true,
    data: {
      scope,
      expires: expiration,
    },
  };
};
