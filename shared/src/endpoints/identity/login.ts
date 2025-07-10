import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto, AuthScopeType } from "../../types";

class LoginDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(data: LoginDto) {
    super(data);
    this.email = data.email ? normalizeEmail(data.email) : data.email;
    this.password = data.password;
  }
}

type LoginResponse = {
  success: boolean;
  data: {
    expires: number;
    scope: AuthScopeType;
    accessToken?: string;
  };
};

export const LoginEndpoint = {
  path: "/login" as const,
  method: "post" as const,
  body: LoginDto,
  response: {} as LoginResponse,
  query: undefined,
  authScope: null,
} satisfies BaseEndpoint<"post">;
