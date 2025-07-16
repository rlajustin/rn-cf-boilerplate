import { verifyAttestation } from "node-app-attest";
import { kvService } from "@services";
import { errorConfig } from "@configs";
import { env } from "hono/adapter";
import { HandlerFunction, Route } from "@routes/utils";

// Used by client to register a new IOS App Attest Key.
const postRegisterAppAttestKey: HandlerFunction<"REGISTER_APP_ATTEST_KEY"> = async (c, dto) => {
  const { ENVIRONMENT, APP_BUNDLE_ID, TEAM_ID } = env(c);
  if (!APP_BUNDLE_ID || !TEAM_ID) throw new Error("Unable to find app data"); // @dev shouldn't happen
  const clientId = c.req.header("x-client-id");
  const requestId = c.req.header("x-request-id");
  if (!clientId || !requestId) {
    throw new errorConfig.BadRequest("Client or request ID not found");
  }

  const { keyId, attestationBase64 } = dto;

  const nonce = await kvService.getAttestationNonce(c.env.KV, clientId, requestId);
  if (!nonce) {
    throw new errorConfig.BadRequest("Attestation challenge not found, please restart");
  }

  const result = await verifyAttestation({
    attestation: Buffer.from(attestationBase64, "base64"),
    challenge: nonce,
    keyId,
    bundleIdentifier: APP_BUNDLE_ID,
    teamIdentifier: TEAM_ID,
    allowDevelopmentEnvironment: ENVIRONMENT !== "prod",
  });
  console.log(result);
  await kvService.setAppAttestKey(c.env.KV, clientId, result.publicKey);
  return {
    success: true,
    message: "App Attest Key registered successfully",
  };
};

export const RegisterAppAttestKeyRoute: Route<"REGISTER_APP_ATTEST_KEY"> = {
  key: "REGISTER_APP_ATTEST_KEY",
  handler: postRegisterAppAttestKey,
};
