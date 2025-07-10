import { IdentityEndpoints } from "./endpoints/identity";
import { AppAttestEndpoints } from "./endpoints/app-attest";
import { ProtectedUnverifiedEndpoints } from "./endpoints/protected-unverified";
import { ProtectedEndpoints } from "./endpoints/protected";
import { AuthScopeType, AuthScope } from "./types";

export { AuthScopeType, AuthScope };
export { IdentityEndpoints, AppAttestEndpoints, ProtectedEndpoints, ProtectedUnverifiedEndpoints };

export const AllEndpoints = {
  ...IdentityEndpoints,
  ...AppAttestEndpoints,
  ...ProtectedEndpoints,
  ...ProtectedUnverifiedEndpoints,
};

export type PostEndpointsKeys = keyof typeof AllEndpoints &
  {
    [K in keyof typeof AllEndpoints]: (typeof AllEndpoints)[K]["method"] extends "post" ? K : never;
  }[keyof typeof AllEndpoints];

export type GetEndpointsKeys = keyof typeof AllEndpoints &
  {
    [K in keyof typeof AllEndpoints]: (typeof AllEndpoints)[K]["method"] extends "get" ? K : never;
  }[keyof typeof AllEndpoints];

export interface AccessTokenBody {
  sub: string;
  email: string;
  scope: AuthScopeType;
  iat: number;
  exp: number;
  [key: string]: unknown;
}
