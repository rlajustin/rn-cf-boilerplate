import { IsString, IsNotEmpty } from "class-validator";
import { BaseEndpoint, BaseDto } from "../../types";

class PasswordResetConfirmDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  constructor(dto: PasswordResetConfirmDto) {
    super(dto);
    this.token = dto.token;
    this.newPassword = dto.newPassword;
  }
}

type PasswordResetConfirmResponse = {
  success: boolean;
  message: string;
};

export const PasswordResetConfirmEndpoint = {
  path: "/password-reset/confirm" as const,
  method: "post" as const,
  body: PasswordResetConfirmDto,
  response: {} as PasswordResetConfirmResponse,
  query: undefined,
  authenticate: false,
} satisfies BaseEndpoint<"post">;
