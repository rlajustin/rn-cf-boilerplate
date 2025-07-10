import { BaseEndpoint } from "../../types";

type PasswordResetValidateResponse = {
  valid: boolean;
};

export const PasswordResetValidateEndpoint = {
  path: "/password-reset/validate" as const,
  method: "get" as const,
  body: undefined,
  response: {} as PasswordResetValidateResponse,
  query: { token: "" } as { token: string },
  authScope: null,
} satisfies BaseEndpoint<"get">;
