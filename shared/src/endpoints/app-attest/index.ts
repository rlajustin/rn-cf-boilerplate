import { RegisterAppAttestKeyEndpoint } from "./register-app-attest-key";
import { AttestationChallengeEndpoint } from "./attestation-challenge";

export const AppAttestEndpoints = {
  REGISTER_APP_ATTEST_KEY: RegisterAppAttestKeyEndpoint,
  POST_ATTESTATION_CHALLENGE: AttestationChallengeEndpoint,
};
