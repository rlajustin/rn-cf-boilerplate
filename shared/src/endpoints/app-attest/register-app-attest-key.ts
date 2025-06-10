import { IsString, IsNotEmpty } from "class-validator";
import { BaseEndpoint, BaseDto } from "../../types";

export class RegisterAppAttestKeyDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  keyId: string;

  @IsString()
  @IsNotEmpty()
  attestationBase64: string;

  constructor(dto: RegisterAppAttestKeyDto) {
    super(dto);
    this.keyId = dto.keyId;
    this.attestationBase64 = dto.attestationBase64;
  }
}

type RegisterAppAttestKeyResponse = {
  message: string;
};

export const RegisterAppAttestKeyEndpoint = {
  path: "/register-app-attest-key" as const,
  method: "post" as const,
  body: RegisterAppAttestKeyDto,
  response: {} as RegisterAppAttestKeyResponse,
  query: undefined,
  authenticate: false,
} satisfies BaseEndpoint<"post">;
