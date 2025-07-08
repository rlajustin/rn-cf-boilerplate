import { normalizeEmail } from "../../utils";
import { BaseEndpoint, BaseDto } from "../../types";
import { IsEmail, IsNotEmpty } from "class-validator";

class ChangeEmailRequestDto extends BaseDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  constructor(dto: ChangeEmailRequestDto) {
    super(dto);
    this.newEmail = normalizeEmail(dto.newEmail);
  }
}

type ChangeEmailRequestResponse = {
  success: boolean;
  newEmail: string;
  message: string;
};

export const ChangeEmailRequestEndpoint = {
  path: "/change-email-request" as const,
  method: "post" as const,
  body: ChangeEmailRequestDto,
  response: {} as ChangeEmailRequestResponse,
  query: undefined,
  authenticate: true,
} satisfies BaseEndpoint<"post">;
