import { BaseEndpoint } from "../../types";

type AttestationChallengeResponse = {
  nonce: string;
};

export const AttestationChallengeEndpoint = {
  path: "/attestation-challenge" as const,
  method: "get" as const,
  body: undefined,
  response: {} as AttestationChallengeResponse,
  query: {},
  authScope: null,
} satisfies BaseEndpoint<"get">;
