import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BaseEndpoint, BaseDto } from "../../types";
import { normalizeEmail } from "../../utils";

class ExampleDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  exampleData1: string;

  @IsEmail()
  @IsNotEmpty()
  exampleData2: string;

  @IsNumber()
  exampleData3: number;

  constructor(dto: ExampleDto) {
    super(dto);
    this.exampleData1 = dto.exampleData1;
    this.exampleData2 = normalizeEmail(dto.exampleData2);
    this.exampleData3 = dto.exampleData3;
  }
}

type ExampleResponse = {
  message: string;
  data: {
    exampleData1: string;
    exampleData2: string;
    exampleData3: number;
  };
};

export const ExampleEndpoint = {
  path: "/example" as const,
  method: "post" as const,
  body: ExampleDto,
  response: {} as ExampleResponse,
  query: undefined,
  authScope: "user",
} satisfies BaseEndpoint<"post">;
