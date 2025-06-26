import { IsEmail, IsNotEmpty } from "class-validator";
import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto } from "../../types";

class PasswordResetRequestDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  constructor(dto: PasswordResetRequestDto) {
    super(dto);
    this.email = dto.email ? normalizeEmail(dto.email) : dto.email;
  }
}

type PasswordResetRequestResponse = {
  success: boolean;
  message: string;
};

export const PasswordResetRequestEndpoint = {
  path: "/password-reset/request" as const,
  method: "post" as const,
  body: PasswordResetRequestDto,
  response: {} as PasswordResetRequestResponse,
  query: undefined,
  authenticate: false,
} satisfies BaseEndpoint<"post">;
