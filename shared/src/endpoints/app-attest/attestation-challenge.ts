import { BaseDto, BaseEndpoint } from "../../types";

class AttestationChallengeDto extends BaseDto {
  constructor(dto: AttestationChallengeDto) {
    super(dto);
  }
}

type AttestationChallengeResponse = {
  nonce: string;
};

export const AttestationChallengeEndpoint = {
  path: "/attestation-challenge" as const,
  method: "post" as const,
  body: AttestationChallengeDto,
  response: {} as AttestationChallengeResponse,
  query: undefined,
  authScope: null,
} satisfies BaseEndpoint<"post">;
