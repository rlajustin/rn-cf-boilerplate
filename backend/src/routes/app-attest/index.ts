import { Hono } from "hono";
import { typeConfig } from "@configs";
import { mountRoutes } from "@routes/utils";
import { AttestationChallengeRoute } from "./attestation-challenge";
import { RegisterAppAttestKeyRoute } from "./register-app-attest-key";

const appAttestRoutes = new Hono<typeConfig.Context>();

const routes = [AttestationChallengeRoute, RegisterAppAttestKeyRoute];

mountRoutes(routes, appAttestRoutes);

export default appAttestRoutes;
