import { HandlerFunction, Route } from "@routes/utils";
import { authUtil } from "@utils";

const postExample: HandlerFunction<"EXAMPLE"> = async (c, dto) => {
  // Get the authenticated user's information using helper functions
  const authenticatedUser = authUtil.getAuthenticatedUser(c);

  return {
    message: "Success!",
    data: {
      exampleData1: dto.exampleData1,
      exampleData2: dto.exampleData2,
      exampleData3: dto.exampleData3,
      // Additional user context for demonstration
      authenticatedUser,
    },
  };
};

export const ExampleRoute: Route<"EXAMPLE"> = {
  key: "EXAMPLE",
  handler: postExample,
};
