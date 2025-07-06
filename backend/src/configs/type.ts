import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { type AccessTokenBody } from "shared";

export type { AccessTokenBody };

export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  RATE_LIMITER: DurableObjectNamespace;
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
    access_token_body?: AccessTokenBody;
    // basic_auth_body?: BasicAuthBody;
    // session: Session;
    // session_key_rotation: boolean;
  };
};

export type App = Hono<Context, BlankSchema, "/">;
