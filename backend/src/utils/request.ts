import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { typeConfig } from "@configs";
import { WorkersKVStore } from "@hono-rate-limiter/cloudflare";

export const stripEndingSlash = (val: string): string => {
  return val.replace(/\/$/, "");
};

export const getQueryString = (c: Context<typeConfig.Context>): string => c.req.url.split("?")[1];

export const getRequestIP = (c: Context<typeConfig.Context>): string => {
  // Get the IP directly from Cloudflare's cf object
  // This is the most reliable way to get the client's real IP
  const cf = c.req.raw.cf as { ip: string; ipv4?: string } | undefined;
  if (cf?.ip) {
    // If it's an IPv6, try to get the IPv4 if available
    if (cf.ip.includes(":") && cf.ipv4) {
      return cf.ipv4;
    }
    return cf.ip;
  }

  // Fallback to headers if cf object is somehow not available
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0].trim();

  return ip || "unknown";
};
