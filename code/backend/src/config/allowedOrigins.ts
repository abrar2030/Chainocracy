// Allowed CORS origins.
//
// Origins can be supplied at runtime via the CORS_ORIGIN environment variable
// (comma-separated) so deployments (for example docker-compose) can configure
// them without a code change. The env origins are merged with the local
// development defaults below.

const devDefaults: string[] = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3007",
  "http://localhost:3010",
  "http://localhost:5173", // vite dev server
  "http://localhost:8080", // web frontend behind nginx (docker-compose)
  "http://127.0.0.1:5500",
];

const fromEnv: string[] = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

const allowedOrigins: string[] = Array.from(
  new Set([...fromEnv, ...devDefaults]),
);

export = allowedOrigins;
