import { ProtectedEndpoint } from "src/types";

import { ExampleEndpoint } from "./example";
import { DeleteAccountEndpoint } from "./delete-account";
import { ChangeEmailRequestEndpoint } from "./change-email-request";

export const ProtectedEndpoints = {
  EXAMPLE: ExampleEndpoint,
  DELETE_ACCOUNT: DeleteAccountEndpoint,
  CHANGE_EMAIL_REQUEST: ChangeEmailRequestEndpoint,
} satisfies Record<string, ProtectedEndpoint>;
