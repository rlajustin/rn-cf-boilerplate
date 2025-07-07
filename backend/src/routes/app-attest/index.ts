import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";
import { AttestationChallengeRoute } from "./attestation-challenge";
import { RegisterAppAttestKeyRoute } from "./register-app-attest-key";
import { rateLimit } from "@middleware";

const appAttestRoutes = new Hono<typeConfig.Context>();

const routes = [AttestationChallengeRoute, RegisterAppAttestKeyRoute];

appAttestRoutes.use("*", async (c, next) => {
  await rateLimit({ c, next, authed: false });
});

mountRoutes(routes, appAttestRoutes);

export default appAttestRoutes;
