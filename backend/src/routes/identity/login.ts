import { setCookie } from "hono/cookie";
import { env } from "hono/adapter";
import * as schema from "@schema";
import { jwtService } from "@services";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";

const postLogin: HandlerFunction<"LOGIN"> = async (c, dto) => {
  const db = c.get("db");

  const [user]: schema.User[] = await db.select().from(schema.users).where(eq(schema.users.email, dto.email)).limit(1);

  if (!user) {
    return { success: false, message: "Invalid credentials" };
  }

  const isValidPassword = await bcrypt.compare(dto.password, user.password);
  if (!isValidPassword) {
    return { success: false, message: "Invalid credentials" };
  }

  const accessToken = await authUtil.generateAccessToken(c, user);

  // Safely extract expiration from token
  const { scope } = jwtService.decodeToken(accessToken);
  const expiration = jwtService.getTokenExpiration(accessToken);

  // Generate and store refresh token
  const { refreshToken, refreshTokenExpires } = await authUtil.generateAndStoreRefreshToken(db, user.userId);

  if (authUtil.isMobile(c)) {
    return {
      success: true,
      data: {
        cookies: {
          tokens: {
            accessToken,
            refreshToken,
          },
          exp: {
            accessToken: expiration,
            refreshToken: refreshTokenExpires,
          },
        },
        scope,
        expires: expiration,
      },
    };
  } else {
    const origin = c.req.header("Origin");
    // For web clients, set HTTP-only cookies
    setCookie(c, authUtil.ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: origin?.includes("localhost") && env(c).ENVIRONMENT !== "prod" ? false : true,
      sameSite: "Lax",
      path: "/",
      maxAge: expiration - Date.now(),
    });
    setCookie(c, authUtil.REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: origin?.includes("localhost") && env(c).ENVIRONMENT !== "prod" ? false : true,
      sameSite: "Lax",
      path: "/api/refresh",
      maxAge: 60 * 60 * 24 * 400, // 400 days
    });
  }

  return {
    success: true,
    data: {
      scope,
      cookies: {
        exp: {
          accessToken: expiration,
          refreshToken: refreshTokenExpires,
        },
      },
    },
  };
};

export const LoginRoute: Route<"LOGIN"> = {
  key: "LOGIN",
  handler: postLogin,
};
