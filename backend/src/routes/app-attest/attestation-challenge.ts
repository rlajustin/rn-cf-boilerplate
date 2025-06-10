import { randomUUID } from "crypto";
import { HandlerFunction, Route } from "@routes/utils";
import { errorConfig } from "@configs";
import { kvService } from "@services";

const getAttestationChallenge: HandlerFunction<"GET_ATTESTATION_CHALLENGE"> = async (c) => {
  const clientId = c.req.header("x-client-id");
  const requestId = c.req.header("x-request-id");
  if (!clientId || !requestId) {
    throw new errorConfig.BadRequest("Client or request ID not found");
  }

  const nonce = randomUUID();
  await kvService.setAttestationNonce(c.env.KV, clientId, requestId, nonce);
  return {
    nonce,
  };
};

export const AttestationChallengeRoute: Route<"GET_ATTESTATION_CHALLENGE"> = {
  key: "GET_ATTESTATION_CHALLENGE",
  handler: getAttestationChallenge,
};
