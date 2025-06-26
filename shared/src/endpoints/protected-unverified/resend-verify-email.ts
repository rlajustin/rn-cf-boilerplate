import { BaseEndpoint, BaseDto } from "../../types";

class ResendVerifyEmailDto extends BaseDto {
  constructor(dto: ResendVerifyEmailDto) {
    super(dto);
  }
}

type ResendVerifyEmailResponse = {
  success: boolean;
  message: string;
};

export const ResendVerifyEmailEndpoint = {
  path: "/resend-verify-email" as const,
  method: "post" as const,
  body: ResendVerifyEmailDto,
  response: {} as ResendVerifyEmailResponse,
  query: undefined,
  authenticate: true,
} satisfies BaseEndpoint<"post">;
