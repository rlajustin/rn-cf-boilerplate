import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto } from "../../types";

class RegisterAccountDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(dto: RegisterAccountDto) {
    super(dto);
    this.email = dto.email ? normalizeEmail(dto.email) : dto.email;
    this.displayName = dto.displayName;
    this.password = dto.password;
  }
}

type RegisterAccountResponse = {
  success: boolean;
  message: string;
};

export const RegisterAccountEndpoint = {
  path: "/register-account" as const,
  method: "post" as const,
  body: RegisterAccountDto,
  response: {} as RegisterAccountResponse,
  query: undefined,
  authenticate: false,
} satisfies BaseEndpoint<"post">;
