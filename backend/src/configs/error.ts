import { HTTPException } from "hono/http-exception";

const getOption = (message?: string) => (message ? { message } : undefined);

export class BadRequest {
  constructor(message?: string) {
    return new HTTPException(400, getOption(message));
  }
}

export class Unauthorized {
  constructor(message?: string) {
    return new HTTPException(401, getOption(message));
  }
}

export class Forbidden {
  constructor(message?: string) {
    return new HTTPException(403, getOption(message));
  }
}

export class NotFound {
  constructor(message?: string) {
    return new HTTPException(404, getOption(message));
  }
}

export class TooManyRequests {
  constructor(message?: string) {
    return new HTTPException(429, getOption(message));
  }
}

export class InternalServerError {
  constructor(message?: string) {
    return new HTTPException(500, getOption(message));
  }
}
