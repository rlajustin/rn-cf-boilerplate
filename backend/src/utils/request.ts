import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { typeConfig } from "@configs";
import { getConnInfo } from "hono/cloudflare-workers";

export const stripEndingSlash = (val: string): string => {
  return val.replace(/\/$/, "");
};

export const getQueryString = (c: Context<typeConfig.Context>): string => c.req.url.split("?")[1];

export const getRequestIP = (c: Context<typeConfig.Context>): string | undefined => {
  const info = getConnInfo(c);
  const ip = info.remote.address;

  return ip;
};
