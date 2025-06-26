import { IdentityEndpoints } from "./endpoints/identity";
import { AppAttestEndpoints } from "./endpoints/app-attest";
import { ProtectedUnverifiedEndpoints } from "./endpoints/protected-unverified";
import { ProtectedEndpoints } from "./endpoints/protected";

export { IdentityEndpoints, AppAttestEndpoints, ProtectedEndpoints, ProtectedUnverifiedEndpoints };

export const AllEndpoints = {
  ...IdentityEndpoints,
  ...AppAttestEndpoints,
  ...ProtectedEndpoints,
  ...ProtectedUnverifiedEndpoints,
};

export interface AccessTokenBody {
  sub: string;
  email: string;
  scope: "unverified" | "user" | "admin";
  iat: number;
  exp: number;
  [key: string]: unknown;
}
