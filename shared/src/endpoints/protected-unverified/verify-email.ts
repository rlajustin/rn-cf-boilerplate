import { IsNotEmpty, IsString } from "class-validator";
import { BaseEndpoint, BaseDto } from "../../types";

class VerifyEmailDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  constructor(dto: VerifyEmailDto) {
    super(dto);
    this.code = dto.code;
  }
}

type VerifyEmailResponse = {
  success: boolean;
  message: string;
};

export const VerifyEmailEndpoint = {
  path: "/verify-email" as const,
  method: "post" as const,
  body: VerifyEmailDto,
  response: {} as VerifyEmailResponse,
  query: undefined,
  authenticate: true,
} satisfies BaseEndpoint<"post">;
