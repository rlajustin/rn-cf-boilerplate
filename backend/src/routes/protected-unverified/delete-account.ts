import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";
import { eq } from "drizzle-orm";
import * as schema from "@schema";

const postDeleteAccount: HandlerFunction<"DELETE_ACCOUNT"> = async (c, dto) => {
  // Get the authenticated user's information using helper functions
  const db = c.get("db");
  const authenticatedUser = authUtil.getAuthenticatedUser(c);

  const [deletedUser] = await db.delete(schema.users).where(eq(schema.users.userId, authenticatedUser.sub)).returning();
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
