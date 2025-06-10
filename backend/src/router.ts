import { Hono } from "hono";
import { env } from "hono/adapter";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { loggerUtil, requestUtil } from "@utils";
import { typeConfig } from "@configs";
import { identityRoutes, appAttestRoutes, protectedRoutes } from "@routes";
import { cors } from "hono/cors";
import { authenticate } from "@middleware";
import { version } from "../package.json";

// Simple memory store for rate limiting
const store = new Map();
const windowMs = 5 * 1000;
const limit = 5;

const rateLimit = {
  increment: async (key: string) => {
    const now = Date.now();
    const data = store.get(key) || {
      count: 0,
      resetTime: now + windowMs, // 5 seconds
    };

    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count++;
    }

    store.set(key, data);
    return {
      totalHits: data.count,
      resetTime: new Date(data.resetTime),
    };
  },
  decrement: async (key: string) => {
    const data = store.get(key);
    if (data) {
      data.count = Math.max(0, data.count - 1);
      store.set(key, data);
    }
  },
  resetKey: async (key: string) => {
    store.delete(key);
  },
};

export const loadRouters = (app: Hono<typeConfig.Context>) => {
  app.use((c, next) => {
    const ip = requestUtil.getRequestIP(c) || "unknown";
    loggerUtil.infoLogger(`Request from IP: ${ip}`);

    return rateLimiter<typeConfig.Context>({
      windowMs,
      limit,
      standardHeaders: "draft-6",
      keyGenerator: () => ip,
      store: rateLimit,
      message: `Too many requests from ${ip}, please wait before trying again.`,
    })(c, next);
  });

  app.use(async (c, next) => {
    const { LOG_LEVEL: logLevel, ENVIRONMENT: environment } = env(c);
    if (logLevel === loggerUtil.LoggerLevel.Info || environment === "local") {
      const loggerMiddleware = logger(loggerUtil.customLogger);
      return loggerMiddleware(c, next);
    }
    await next();
  });

  app.use(async (c, next) => {
    const { ENVIRONMENT } = env(c);
    return cors({
      origin: ENVIRONMENT === "local" ? "http://localhost:8081" : "*",
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "x-platform",
        "x-client-id",
        "x-request-id",
        "x-client-attestation",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: ENVIRONMENT === "local",
    })(c, next);
  });

  app.route("/api", identityRoutes);
  app.route("/api", appAttestRoutes);

  if (process.env.ENVIRONMENT !== "prod") {
    app.get("/", (c) => c.redirect("/debug"));
    app.get("/routes", (c) => {
      const routes = app.routes
        .map((r) => ({
          method: r.method,
          path: r.path,
        }))
        .filter((r) => r.path !== "/" && r.method !== "ALL");
      return c.json(routes);
    });

    // Debug interface
    app.get("/debug", (c) => {
      return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>API Debug Interface</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-4">
          <div class="container mx-auto grid grid-cols-2 gap-4">
            <div class="border rounded p-4">
              <h2 class="text-xl font-bold mb-4">Available Routes</h2>
              <div id="routes-list" class="space-y-2"></div>
            </div>
            
            <div class="border rounded p-4">
              <h2 class="text-xl font-bold mb-4">Request Builder</h2>
              <div id="request-builder">
                <p class="text-gray-500">Select a route to start building a request</p>
              </div>
            </div>
          </div>

          <script>
            let selectedRoute = null;
            const requestParams = {
              queryParams: {},
              headers: {},
              body: ''
            };

            async function fetchRoutes() {
              try {
                const response = await fetch('/routes');
                const routes = await response.json();
                const routesList = document.getElementById('routes-list');
                
                routes.forEach(route => {
                  const div = document.createElement('div');
                  div.className = 'p-2 rounded cursor-pointer hover:bg-gray-100';
                  div.onclick = () => selectRoute(route);
                  
                  const methodColor = {
                    'GET': 'bg-green-200',
                    'POST': 'bg-blue-200',
                    'PUT': 'bg-yellow-200',
                    'DELETE': 'bg-red-200'
                  }[route.method] || 'bg-gray-200';
                  
                  div.innerHTML = \`
                    <span class="inline-block px-2 py-1 rounded text-sm mr-2 \${methodColor}">
                      \${route.method}
                    </span>
                    \${route.path}
                  \`;
                  
                  routesList.appendChild(div);
                });
              } catch (error) {
                console.error('Failed to fetch routes:', error);
              }
            }

            function selectRoute(route) {
              selectedRoute = route;
              requestParams.queryParams = {};
              requestParams.headers = {};
              requestParams.body = '';
              
              const builder = document.getElementById('request-builder');
              builder.innerHTML = \`
                <div class="space-y-4">
                  <div>
                    <h3 class="font-semibold mb-2">Query Parameters</h3>
                    <div id="query-params"></div>
                    <button onclick="addParam('queryParams')" class="text-sm text-blue-600 mt-2">
                      + Add Query Parameter
                    </button>
                  </div>

                  <div>
                    <h3 class="font-semibold mb-2">Headers</h3>
                    <div id="headers"></div>
                    <button onclick="addParam('headers')" class="text-sm text-blue-600 mt-2">
                      + Add Header
                    </button>
                  </div>

                  \${route.method !== 'GET' ? \`
                    <div>
                      <h3 class="font-semibold mb-2">Request Body</h3>
                      <textarea
                        id="body"
                        class="w-full h-32 border rounded px-2 py-1"
                        placeholder="Enter JSON body"
                        onchange="updateBody(this.value)"
                      ></textarea>
                    </div>
                  \` : ''}

                  <button
                    onclick="sendRequest()"
                    class="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Send Request
                  </button>

                  <div id="response" class="mt-4"></div>
                </div>
              \`;
              
              renderParams();
            }

            function addParam(type) {
              const key = prompt(\`Enter \${type === 'queryParams' ? 'query parameter' : 'header'} key:\`);
              if (key) {
                requestParams[type][key] = '';
                renderParams();
              }
            }

            function updateParam(type, key, value) {
              requestParams[type][key] = value;
            }

            function removeParam(type, key) {
              delete requestParams[type][key];
              renderParams();
            }

            function updateBody(value) {
              requestParams.body = value;
            }

            function renderParams() {
              ['queryParams', 'headers'].forEach(type => {
                const container = document.getElementById(type.replace('P', '-p'));
                if (!container) return;
                
                container.innerHTML = Object.entries(requestParams[type])
                  .map(([key, value]) => \`
                    <div class="flex gap-2 mb-2">
                      <input
                        class="border rounded px-2 py-1 w-1/3"
                        value="\${key}"
                        disabled
                      />
                      <input
                        class="border rounded px-2 py-1 flex-1"
                        value="\${value}"
                        onchange="updateParam('\${type}', '\${key}', this.value)"
                        placeholder="Value"
                      />
                      <button
                        class="px-2 py-1 bg-red-100 rounded"
                        onclick="removeParam('\${type}', '\${key}')"
                      >×</button>
                    </div>
                  \`).join('');
              });
            }

            async function sendRequest() {
              if (!selectedRoute) return;

              const queryString = new URLSearchParams(requestParams.queryParams).toString();
              const url = \`\${selectedRoute.path}\${queryString ? \`?\${queryString}\` : ''}\`;

              try {
                const response = await fetch(url, {
                  method: selectedRoute.method,
                  headers: {
                    'Content-Type': 'application/json',
                    ...requestParams.headers
                  },
                  body: requestParams.body ? requestParams.body : undefined
                });
                const responseDiv = document.getElementById('response');
                responseDiv.innerHTML = \`
                  <h3 class="font-semibold mb-2">Response (Status: \${response.status} \${response.statusText})</h3>
                  <pre class="bg-gray-100 p-2 rounded overflow-auto">\${response.status === 200 ? JSON.stringify(await response.json(), null, 2) : await response.text()}</pre>
                \`;
              } catch (error) {
                const responseDiv = document.getElementById('response');
                responseDiv.innerHTML = \`
                  <h3 class="font-semibold mb-2">Error</h3>
                  <div class="bg-red-100 p-2 rounded overflow-auto">
                    <p class="font-semibold text-red-700">Status: \${error.status || 'Unknown'}</p>
                    <pre>\${error.toString()}\n\nStack Trace:\n\${error.stack || 'No stack trace available'}</pre>
                  </div>
                \`;
              }
            }

            // Initialize
            fetchRoutes();
          </script>
        </body>
      </html>
    `);
    });

    // Base route
    app.get("/status", (c) => {
      return c.json({
        message: "Welcome to API",
        version,
        environment: c.env.ENVIRONMENT || "unknown",
      });
    });
  }

  app.route("/api", protectedRoutes);

  return app;
};
