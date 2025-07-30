import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";
import { env } from "hono/adapter";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import * as schema from "@schema";
import { cryptoUtil } from "@utils";
import { errorConfig } from "@configs";

const postLogout: HandlerFunction<"LOGOUT"> = async (c) => {
  // Get the authenticated user's information using helper functions
  const db = c.get("db");
  const refreshToken = getCookie(c, authUtil.REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    throw new errorConfig.BadRequest("Refresh token not found");
  }

  const hashedToken = cryptoUtil.hashString(refreshToken);
  const [deletedToken] = await db
    .delete(schema.refreshTokens)
    .where(eq(schema.refreshTokens.token, hashedToken))
    .returning();

  if (deletedToken) {
    return {
      success: true,
      message: "Successfully logged out",
    };
  } else {
    return {
      success: false,
      message: "Authorization token not found, logged out by force.",
    };
  }
};

export const LogoutRoute: Route<"LOGOUT"> = {
  key: "LOGOUT",
  handler: postLogout,
};
