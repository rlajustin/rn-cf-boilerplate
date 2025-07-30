/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { type AccessTokenBody } from "shared";

export type DrizzleDB = ReturnType<typeof import("drizzle-orm/postgres-js").drizzle>;

export type RateLimitBinding = {
  limit: ({ key }: { key: string }) => {
    key: string;
    success: boolean;
  };
};

export type { AccessTokenBody };

export type Bindings = {
  KV: KVNamespace;
  AUTHED_RATE_LIMITER: RateLimitBinding;
  BASE_RATE_LIMITER: RateLimitBinding;
  HYPERDRIVE: Hyperdrive;
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_SENDER_ADDRESS: string;
  SMTP_SENDER_NAME: string;
  APP_BUNDLE_ID: string;
  TEAM_ID: string;
  EMAIL_VERIFICATION_CODE_LIMIT: number;
  JWT_SECRET: string;
  // Should implement "PAST_JWT_SECRET" for key cycling (implement it in jwt service too)
};

export type Context = {
  Bindings: Bindings;
  Variables: {
    db: DrizzleDB;
    access_token_body?: AccessTokenBody;
  };
};

export type App = Hono<Context, BlankSchema, "/">;
