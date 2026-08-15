import { setMaxListeners } from "node:events";
import type { NextFunction, Request, Response } from "express";
import BlockChain from "../../../../blockchain/src/core/blockchain";
import type { Block } from "../../../../blockchain/src/core/data_types";

const axios = require("axios");
const express = require("express");
const verifyJWTWeb = require("../../middleware/verifyJWTWeb");

const LOCALHOST = "http://localhost:";
const OFFSET = "/api/blockchain";

// ── Response helpers ──────────────────────────────────────────────────────────

const errorResponse = (
  res: Response,
  status: number,
  message: string,
  details: any = null,
) => {
  const body: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (details) body.details = details;
  return res.status(status).json(body);
};

const successResponse = (
  res: Response,
  status: number,
  data: any,
  message = "Operation successful",
) =>
  res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      console.error(`API Error: ${err.message}`, err);
      return errorResponse(
        res,
        500,
        "Internal server error",
        process.env.NODE_ENV === "development" ? err.message : null,
      );
    });

// ── Module factory ────────────────────────────────────────────────────────────

module.exports = (
  blockchain: BlockChain,
  allNodes: string[] | (() => string[]),
) => {
  // Created fresh per call, not at module scope: since Node caches this
  // module, a module-level router would be a process-wide singleton that
  // accumulates duplicate handlers every time this factory is invoked more
  // than once (multiple blockchain instances in one process, or a test
  // harness). Mirrors the existing pattern in api/index.ts.
  const router = express.Router();
  const NODE_ADDRESS = blockchain.nodeAddress || "?";

  // `allNodes` may be a static array (single-node deployments, e.g.
  // code/backend/src/index.ts) or a getter (P2P deployments, e.g.
  // code/backend/src/network/network.ts, where the peer list changes as
  // nodes join/leave). Always resolve it fresh so P2P callers see live
  // membership instead of whatever the list looked like when this router
  // was constructed.
  const resolveNodes = (): string[] =>
    typeof allNodes === "function" ? allNodes() : allNodes;

  // ── Middleware ──────────────────────────────────────────────────────────────

  const validateTransaction = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { identifier, choiceCode } = req.body;
    if (!identifier)
      return errorResponse(res, 400, "Missing required field: identifier");
    if (!choiceCode)
      return errorResponse(res, 400, "Missing required field: choiceCode");
    if (Number.isNaN(parseInt(choiceCode, 10)))
      return errorResponse(res, 400, "Invalid choice code: must be a number");
    next();
  };

  const checkVote = (identifier: string, choiceCode: number): boolean =>
    typeof identifier === "string" &&
    identifier.trim().length > 0 &&
    Number.isInteger(choiceCode) &&
    choiceCode > 0;

  // ── P2P helpers ─────────────────────────────────────────────────────────────

  const broadcastData = async (
    endpoint: string,
    data: any,
  ): Promise<any[] | undefined> => {
    try {
      const responses = await Promise.all(
        resolveNodes()
          .filter((url) => url !== NODE_ADDRESS)
          .map((url) => axios.post(LOCALHOST + url + OFFSET + endpoint, data)),
      );
      return responses.map((r: any) => r.data);
    } catch (err: unknown) {
      console.error("Broadcast error:", err);
      return undefined;
    }
  };

  const runConsensus = async () => {
    try {
      const peers = resolveNodes().filter((url) => url !== NODE_ADDRESS);
      if (peers.length === 0) return;

      const responses = await Promise.all(
        peers.map((url) => axios.get(LOCALHOST + url + OFFSET)),
      );
      let longestChain: Block[] = blockchain.getChain();

      for (const r of responses) {
        const remote = r.data?.data;
        if (
          Array.isArray(remote?.chain) &&
          remote.chain.length > longestChain.length
        ) {
          longestChain = remote.chain;
        }
      }

      if (longestChain !== blockchain.getChain()) {
        await broadcastData("/synchronize-chain", { chain: longestChain });
      }
    } catch (err: unknown) {
      console.error("Consensus error:", err);
    }
  };

  setMaxListeners(15);

  // ── Routes ──────────────────────────────────────────────────────────────────

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(res, 200, {
        chain: blockchain.getChain(),
        length: blockchain.getLengthChain(),
      }),
    ),
  );

  router.get(
    "/chain",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(res, 200, {
        chain: blockchain.getChain(),
        length: blockchain.getLengthChain(),
      }),
    ),
  );

  router.get(
    "/pending-transactions",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(res, 200, blockchain.getPendingTransactions()),
    ),
  );

  router.get(
    "/transactions",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(res, 200, blockchain.getTransactions()),
    ),
  );

  router.get(
    "/blocks",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(res, 200, blockchain.getBlocks()),
    ),
  );

  router.get(
    "/block-detail/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const blockHash = req.params.id;
      if (!blockHash) return errorResponse(res, 400, "Block hash is required");
      const block = blockchain.getBlockDetails(blockHash);
      if (!block) return errorResponse(res, 404, "Block not found");
      return successResponse(res, 200, block);
    }),
  );

  router.get(
    "/get-results",
    verifyJWTWeb,
    asyncHandler(async (_req: Request, res: Response) => {
      const results = await blockchain.smartContract.getResults();
      if (!results) return errorResponse(res, 404, "No results available");
      return successResponse(res, 200, results);
    }),
  );

  router.get(
    "/get-results-computed",
    asyncHandler(async (_req: Request, res: Response) => {
      const results = await blockchain.smartContract.getResultsComputed();
      if (!results)
        return errorResponse(res, 404, "No computed results available");
      return successResponse(res, 200, results);
    }),
  );

  router.get(
    "/voting-status",
    asyncHandler(async (req: Request, res: Response) => {
      const { electoralId } = req.query;
      if (!electoralId || typeof electoralId !== "string")
        return errorResponse(
          res,
          400,
          "Missing required query param: electoralId",
        );

      const identifier =
        await blockchain.getCitizenRelatedIdentifier(electoralId);
      if (!identifier)
        return errorResponse(res, 404, "Unknown electoral identifier");

      const existing = [
        ...blockchain.getTransactions(),
        ...blockchain.getPendingTransactions(),
      ].find((tx: any) => tx.identifier === identifier);

      if (!existing) return successResponse(res, 200, { hasVoted: false });

      return successResponse(res, 200, {
        hasVoted: true,
        transactionHash: existing.transactionHash,
        voteTimestamp: existing.voteTime
          ? new Date(existing.voteTime).toISOString()
          : undefined,
      });
    }),
  );

  router.post(
    "/transaction",
    validateTransaction,
    asyncHandler(async (req: Request, res: Response) => {
      try {
        const { identifier: electoralId, secret = "" } = req.body;
        const parsedCode = parseInt(req.body.choiceCode, 10);

        if (!checkVote(electoralId, parsedCode))
          return errorResponse(res, 400, "Invalid vote data");

        const identifier =
          await blockchain.getCitizenRelatedIdentifier(electoralId);
        if (!identifier)
          return errorResponse(res, 401, "Invalid electoral identifier");

        const choiceEncrypted = blockchain.encryptDataVoter(
          parsedCode.toString(),
        );
        const electoralEncrypted =
          blockchain.encryptDataIdentifier(electoralId);

        const tx = blockchain.addPendingTransaction(
          identifier,
          electoralEncrypted.CIPHER_TEXT,
          electoralEncrypted.IV,
          choiceEncrypted.CIPHER_TEXT,
          choiceEncrypted.IV,
          secret,
        );

        if (!tx)
          return errorResponse(res, 400, "Transaction validation failed");

        broadcastData("/transaction/broadcast", {
          identifier,
          electoralId: electoralEncrypted.CIPHER_TEXT,
          electoralIdIV: electoralEncrypted.IV,
          choiceCode: choiceEncrypted.CIPHER_TEXT,
          IV: choiceEncrypted.IV,
          secret,
        }).catch((e) => console.warn("Peer broadcast failed:", e));

        return successResponse(res, 201, tx, "Transaction added successfully");
      } catch (err: unknown) {
        console.error("Transaction error:", err);
        return errorResponse(
          res,
          500,
          "Failed to process transaction",
          process.env.NODE_ENV === "development"
            ? (err as Error).message
            : null,
        );
      }
    }),
  );

  // Receives replicated transactions from peers — does NOT re-broadcast (prevents loops)
  router.post(
    "/transaction/broadcast",
    asyncHandler(async (req: Request, res: Response) => {
      const { identifier, electoralId, electoralIdIV, choiceCode, IV, secret } =
        req.body;
      if (!identifier || !electoralId || !electoralIdIV || !choiceCode || !IV)
        return errorResponse(res, 400, "Missing required transaction fields");

      const tx = blockchain.addPendingTransaction(
        identifier,
        electoralId,
        electoralIdIV,
        choiceCode,
        IV,
        secret || "",
      );
      if (!tx) return errorResponse(res, 400, "Failed to add transaction");
      return successResponse(res, 200, tx, "Transaction received");
    }),
  );

  router.get(
    "/voters",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(
        res,
        200,
        { voters: await blockchain.getSmartContractVoters() },
        "Voters retrieved",
      ),
    ),
  );

  router.get(
    "/candidates",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(
        res,
        200,
        { candidates: await blockchain.getSmartContractCandidates() },
        "Candidates retrieved",
      ),
    ),
  );

  router.delete(
    "/clear-voters",
    asyncHandler(async (_req: Request, res: Response) => {
      await blockchain.smartContract.eraseVoters();
      return successResponse(
        res,
        200,
        { voters: await blockchain.smartContract.getVoters() },
        "Voters cleared",
      );
    }),
  );

  router.delete(
    "/clear-results",
    asyncHandler(async (_req: Request, res: Response) => {
      await blockchain.smartContract.eraseResults();
      return successResponse(res, 200, null, "Results cleared");
    }),
  );

  router.delete(
    "/clear-chains",
    asyncHandler(async (_req: Request, res: Response) =>
      successResponse(
        res,
        200,
        { result: await blockchain.clearChainsFromStorage() },
        "Chains cleared",
      ),
    ),
  );

  router.post(
    "/deploy-voters",
    asyncHandler(async (_req: Request, res: Response) => {
      const ans = await blockchain.deployVoters();
      if (ans !== null)
        return successResponse(
          res,
          200,
          { voters: await blockchain.getSmartContractVoters() },
          "Voters deployed",
        );
      return errorResponse(res, 400, "Failed to deploy voters");
    }),
  );

  router.post(
    "/deploy-candidates",
    asyncHandler(async (_req: Request, res: Response) => {
      const ans = await blockchain.deployCandidatesBlockchain();
      if (ans !== null)
        return successResponse(
          res,
          200,
          { candidates: await blockchain.getSmartContractCandidates() },
          "Candidates deployed",
        );
      return errorResponse(res, 400, "Failed to deploy candidates");
    }),
  );

  router.post(
    "/receive-new-block",
    asyncHandler(async (req: Request, res: Response) => {
      const block = req.body;
      if (!block?.blockHeader?.blockHash)
        return errorResponse(res, 400, "Invalid block data");

      const added = blockchain.addBlock(block);
      try {
        await runConsensus();
        if (added) return successResponse(res, 200, null, "Block accepted");
        return errorResponse(res, 400, "Block rejected");
      } catch (err: unknown) {
        return errorResponse(
          res,
          500,
          "Consensus error",
          process.env.NODE_ENV === "development"
            ? (err as Error).message
            : null,
        );
      }
    }),
  );

  router.post(
    "/mine",
    asyncHandler(async (_req: Request, res: Response) => {
      const block: Block | null = blockchain.mineBlock();
      if (!block)
        return errorResponse(
          res,
          400,
          "Mining failed: no pending transactions",
        );

      const added = blockchain.addBlock(block);
      if (!added)
        return errorResponse(
          res,
          500,
          "Block mined but could not be added to chain",
        );

      broadcastData("/receive-new-block", block).catch((e) =>
        console.warn("Mining broadcast failed:", e),
      );
      return successResponse(
        res,
        200,
        { block },
        "New block mined successfully",
      );
    }),
  );

  router.post(
    "/synchronize-chain",
    asyncHandler(async (req: Request, res: Response) => {
      const { chain } = req.body;
      if (!chain || !Array.isArray(chain))
        return errorResponse(res, 400, "Missing or invalid chain data");
      const ok = blockchain.replaceChain(chain as Block[]);
      if (ok) return successResponse(res, 200, null, "Chain synchronized");
      return errorResponse(res, 400, "Failed to synchronize chain");
    }),
  );

  return router;
};
