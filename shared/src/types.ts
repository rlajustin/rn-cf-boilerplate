export abstract class BaseDto {
  constructor(_: any) {}
}

export type HttpMethod = "post" | "get";

export const AuthScope = ["unverified", "user", "admin"] as const;
export type AuthScopeType = (typeof AuthScope)[number] | null;

export type BaseEndpoint<M extends HttpMethod> = {
  path: `/${string}`;
  method: M;
  body: M extends "get" ? undefined : BaseDto;
  response: object;
  query: M extends "get" ? Record<string, string> : undefined;
  authScope: AuthScopeType;
  rateLimitWeight?: WeightRange; // due to performance, don't want this to be too high
};

type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export type WeightRange = IntRange<1, 11>; // accepts numbers 1-10
