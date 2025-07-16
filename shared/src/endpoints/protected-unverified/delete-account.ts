import { BaseEndpoint, BaseDto } from "../../types";

class DeleteAccountDto extends BaseDto {
  constructor(dto: DeleteAccountDto) {
    super(dto);
  }
}

type DeleteAccountResponse = {
  success: boolean;
  message: string;
};

export const DeleteAccountEndpoint = {
  path: "/delete-account" as const,
  method: "post" as const,
  body: DeleteAccountDto,
  response: {} as DeleteAccountResponse,
  query: undefined,
  authScope: "unverified",
} satisfies BaseEndpoint<"post">;
