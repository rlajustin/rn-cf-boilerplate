import { typeConfig, errorConfig } from "@configs";
import { userSchema } from "../../schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { emailService } from "@services";
import * as bcrypt from "bcryptjs";
import { HandlerFunction, Route } from "@routes/utils";
import { EmailValidator } from "@utils/email-validator";

const postRegisterAccount: HandlerFunction<"REGISTER_ACCOUNT"> = async (c, dto) => {
  const db = drizzle(c.env.DB, { schema: { users: userSchema.users } });
  const userTable = userSchema.users;

  try {
    EmailValidator.validate(dto.email);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new errorConfig.BadRequest(error.message);
    }
    throw new errorConfig.BadRequest("Invalid email");
  }

  const user = await db.query.users.findFirst({
    where: eq(userTable.email, dto.email),
  });

  if (user) {
    throw new errorConfig.Forbidden("User already exists");
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(dto.password, salt);

  const res = await db
    .insert(userTable)
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
