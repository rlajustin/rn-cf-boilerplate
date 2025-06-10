import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto } from "../../types";

export class VerifyEmailDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  constructor(dto: VerifyEmailDto) {
    super(dto);
    this.email = dto.email ? normalizeEmail(dto.email) : dto.email;
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
  authenticate: false,
} satisfies BaseEndpoint<"post">;
