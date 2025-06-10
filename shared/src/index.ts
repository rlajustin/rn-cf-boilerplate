import { IdentityEndpoints } from "./endpoints/identity";
import { AppAttestEndpoints } from "./endpoints/app-attest";
import { ExampleEndpoints } from "./endpoints/example";

export { IdentityEndpoints, AppAttestEndpoints, ExampleEndpoints };

export const AllEndpoints = {
  ...IdentityEndpoints,
  ...AppAttestEndpoints,
  ...ExampleEndpoints,
};

export interface AccessTokenBody {
  sub: string;
  email: string;
  scope: string; // "unverified" | "user" | "admin"
  iat: number;
  exp: number;
  [key: string]: unknown;
}
