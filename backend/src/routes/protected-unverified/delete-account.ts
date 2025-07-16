import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";
import { env } from "hono/adapter";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@schema";

const postDeleteAccount: HandlerFunction<"DELETE_ACCOUNT"> = async (c, dto) => {
  // Get the authenticated user's information using helper functions
  const db = drizzle(env(c).DB, { schema });
  const authenticatedUser = authUtil.getAuthenticatedUser(c);

  const [deletedUser] = await db
    .delete(schema.users)
    .where(eq(schema.users.userId, authenticatedUser.sub))
    .limit(1)
    .returning();
  if (!deletedUser)
    return {
      success: false,
      message: "User not found",
    };

  // TODO delete more user data

  return {
    success: true,
    message: "Successfully deleted account",
  };
};

export const DeleteAccountRoute: Route<"DELETE_ACCOUNT"> = {
  key: "DELETE_ACCOUNT",
  handler: postDeleteAccount,
};
