import { BaseEndpoint, BaseDto } from "../../types";

class LogoutDto extends BaseDto {
  constructor(dto: LogoutDto) {
    super(dto);
  }
}

type LogoutResponse = {
  success: boolean;
  message: string;
};

export const LogoutEndpoint = {
  path: "/refresh/logout" as const, // needs to start with /refresh to properly send cookie
  method: "post" as const,
  body: LogoutDto,
  response: {} as LogoutResponse,
  query: undefined,
  authScope: "unverified",
} satisfies BaseEndpoint<"post">;
