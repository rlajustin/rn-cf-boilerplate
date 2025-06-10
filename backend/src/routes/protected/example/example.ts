import { HandlerFunction, Route } from "@routes/utils";

const postExample: HandlerFunction<"EXAMPLE"> = async (c, dto) => {
  console.log(dto);

  return {
    message: "Success!",
    data: {
      exampleData1: dto.exampleData1,
      exampleData2: dto.exampleData2,
      exampleData3: dto.exampleData3,
    },
  };
};

export const ExampleRoute: Route<"EXAMPLE"> = {
  key: "EXAMPLE",
  handler: postExample,
};
