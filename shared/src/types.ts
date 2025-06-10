export abstract class BaseDto {
  constructor(_: any) {}
}

export type HttpMethod = "post" | "get";

export type BaseEndpoint<M extends HttpMethod> = {
  path: `/${string}`;
  method: M;
  body: M extends "get" ? undefined : BaseDto;
  response: object;
  query: M extends "get" ? Record<string, string> : undefined;
  authenticate: boolean;
};
