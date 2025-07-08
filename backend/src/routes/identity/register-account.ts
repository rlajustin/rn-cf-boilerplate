import { typeConfig, errorConfig } from "@configs";
import * as schema from "@schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { emailService } from "@services";
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

  const foundUser = await db.select().from(schema.users).where(eq(schema.users.email, dto.email)).limit(1);

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

  return {
    success: true,
    message: "Email verification code sent successfully",
  };
};

export const RegisterAccountRoute: Route<"REGISTER_ACCOUNT"> = {
  key: "REGISTER_ACCOUNT",
  handler: postRegisterAccount,
};
