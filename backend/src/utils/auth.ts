import { Context } from "hono";
import { typeConfig } from "@configs";
import { errorConfig } from "@configs";

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
