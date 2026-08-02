import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import BlockChain from "../../blockchain/src/core/blockchain";
import { closeDB, connectToDB } from "../../blockchain/src/leveldb";
import allowedOrigins from "./config/allowedOrigins";

dotenv.config({ path: path.join(__dirname, "../.env") });

// Development-only fallback values. If a required secret is not set via
// .env, a fixed insecure default is used instead of leaving it undefined -
// this prevents startup/runtime crashes (e.g. jwt.sign throwing
// "secretOrPrivateKey must have a value") when a .env file is missing,
// misplaced, or incomplete. These defaults are NOT safe for production;
// set real values in .env before deploying anywhere real.
const DEV_FALLBACKS: Record<string, string> = {
  SECRET_KEY_IDENTIFIER:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  SECRET_IV_IDENTIFIER: "0123456789abcdef0123456789abcdef",
  SECRET_KEY_VOTES:
    "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  SECRET_IV_VOTES: "fedcba9876543210fedcba9876543210",
  ACCESS_TOKEN_SECRET: "dev-only-insecure-access-token-secret-change-me",
  REFRESH_TOKEN_SECRET: "dev-only-insecure-refresh-token-secret-change-me",
};

const REQUIRED_ENV_VARS = Object.keys(DEV_FALLBACKS);
const missingVars = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(
    `⚠ Using insecure development defaults for: ${missingVars.join(", ")}. Copy .env.example to .env in code/backend and set real values before this is used for anything beyond local testing.`,
  );
  for (const key of missingVars) {
    process.env[key] = DEV_FALLBACKS[key];
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "QuantumBallot Backend API is running!",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const allNodes = [PORT.toString()];

const startServer = async () => {
  try {
    console.log("Starting QuantumBallot Backend...");

    await connectToDB();
    console.log("Database connected");

    const blockchain = new BlockChain();
    await blockchain.setNodeAddress(PORT.toString());
    console.log("Blockchain initialized");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apiRouter = require("./api/index")(blockchain, allNodes);
    app.use("/api", apiRouter);
    console.log("API routes mounted");

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err.message);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    app.use((_req: Request, res: Response) => {
      res.status(404).json({ success: false, message: "Route not found" });
    });

    const server = app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(
        `✓ QuantumBallot Backend running on http://localhost:${PORT}`,
      );
      console.log(`✓ Health: http://localhost:${PORT}/health`);
      console.log(`✓ API:    http://localhost:${PORT}/api`);
      console.log("=".repeat(50));
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}, shutting down...`);
      server.close(async () => {
        try {
          await closeDB();
        } catch (_) {}
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error: unknown) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
