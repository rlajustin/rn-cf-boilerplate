import { setCookie } from "hono/cookie";
import { env } from "hono/adapter";
import { errorConfig } from "@configs";
import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { authUtil } from "@utils";
import { jwtService, emailService } from "@services";
import * as bcrypt from "bcryptjs";
import { HandlerFunction, Route } from "@routes/utils";
import { EmailValidator } from "@utils/email-validator";

const postRegisterAccount: HandlerFunction<"REGISTER_ACCOUNT"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema });

  try {
    EmailValidator.validate(dto.email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new errorConfig.BadRequest(error.message);
    }
    throw new errorConfig.BadRequest("Invalid email");
  }

  const [foundUser] = await db.select().from(schema.users).where(eq(schema.users.email, dto.email)).limit(1);

  if (foundUser) {
    throw new errorConfig.Forbidden("User already exists");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(dto.password, salt);

  const res = await db
    .insert(schema.users)
    .values({
      email: dto.email,
      displayName: dto.displayName,
      password: hashedPassword,
    })
    .returning();

  const newUser = res[0];

  if (!newUser) {
    throw new errorConfig.InternalServerError("Failed to register user");
  }

  await emailService.handleSendEmailVerificationCode(c, newUser.email, newUser.userId);

  const { refreshToken, refreshTokenExpires } = await authUtil.generateAndStoreRefreshToken(db, newUser.userId);

  const accessToken = await authUtil.generateAccessToken(c, newUser);
  const expiration = jwtService.getTokenExpiration(accessToken);

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
        scope: "unverified",
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

    return {
      success: true,
      data: {
        scope: "unverified",
        cookies: {
          exp: {
            accessToken: expiration,
            refreshToken: refreshTokenExpires,
          },
        },
      },
    };
  }
};

export const RegisterAccountRoute: Route<"REGISTER_ACCOUNT"> = {
  key: "REGISTER_ACCOUNT",
  handler: postRegisterAccount,
};
