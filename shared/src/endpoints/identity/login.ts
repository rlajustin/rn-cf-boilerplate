import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto, AuthScopeType, AuthScope } from "../../types";

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

type LoginResponse =
  | {
      success: true;
      data: {
        scope: AuthScopeType;
        cookies: {
          tokens?: {
            accessToken: string;
            refreshToken: string;
          };
          exp: {
            accessToken: number;
            refreshToken: number;
          };
        };
      };
    }
  | {
      success: false;
      message: string;
    };

export const LoginEndpoint = {
  path: "/login" as const,
  method: "post" as const,
  body: LoginDto,
  response: {} as LoginResponse,
  query: undefined,
  authScope: null,
} satisfies BaseEndpoint<"post">;
