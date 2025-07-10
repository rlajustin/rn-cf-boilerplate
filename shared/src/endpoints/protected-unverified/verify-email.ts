import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BaseEndpoint, BaseDto } from "../../types";

class VerifyEmailDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEmail()
  @IsOptional()
  newEmail?: string;

  constructor(dto: VerifyEmailDto) {
    super(dto);
    this.code = dto.code;
    this.newEmail = dto.newEmail;
  }
}

type VerifyEmailResponse = {
  success: boolean;
  message: string;
  newEmail?: string;
};

export const VerifyEmailEndpoint = {
  path: "/verify-email" as const,
  method: "post" as const,
  body: VerifyEmailDto,
  response: {} as VerifyEmailResponse,
  query: undefined,
  authScope: "unverified",
} satisfies BaseEndpoint<"post">;
