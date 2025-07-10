import { Context, Hono } from "hono";
import { typeConfig } from "@configs";
import { validateUtil } from "@utils";
import { AllEndpoints } from "shared";
import { generateMiddleware } from "@middleware";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type ExpandedRequest<T extends keyof typeof AllEndpoints> = Expand<
  InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>
>;
type ExpandedResponse<T extends keyof typeof AllEndpoints> = Expand<(typeof AllEndpoints)[T]["response"]>;

function createValidatedHandler<T extends keyof typeof AllEndpoints>(
  route: Route<T>
): {
  path: (typeof AllEndpoints)[T]["path"];
  method: (typeof AllEndpoints)[T]["method"];
  validatedHandler: (c: Context<typeConfig.Context>) => Promise<Response>;
} {
  const { path, method } = AllEndpoints[route.key];
  return {
    path,
    method,
    validatedHandler: async (c: Context<typeConfig.Context>) => {
      if (method === "get") {
        const query = c.req.query() as Expand<(typeof AllEndpoints)[T]["query"]>;
        return c.json(await route.handler(c, query));
      } else {
        const body = AllEndpoints[route.key].body;
        const data = await c.req.json();
        const dto = new (body as new (data: any) => InstanceType<NonNullable<(typeof AllEndpoints)[T]["body"]>>)(data);
        if (Object.keys(dto).length > 0) await validateUtil.dto(dto);
        return c.json(await route.handler(c, dto as ExpandedRequest<T>));
      }
    },
  };
}

export type HandlerFunction<T extends keyof typeof AllEndpoints> = {
  [K in T]: (c: Context<typeConfig.Context>, dto: ExpandedRequest<K>) => Promise<ExpandedResponse<K>>;
}[T];
export type Route<T extends keyof typeof AllEndpoints> = {
  key: T;
  handler: HandlerFunction<T>;
};

export function mountRoutes<T extends keyof typeof AllEndpoints>(
  routes: Array<Route<T>>,
  app: Hono<typeConfig.Context>
) {
  routes.forEach((route) => {
    const { path, method, validatedHandler } = createValidatedHandler(route);

    const middleware = generateMiddleware(AllEndpoints[route.key].authScope);

    app.use(path, middleware);
    app[method](path, validatedHandler);
  });
}
