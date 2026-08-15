/**
 * Integration tests for the REAL blockchain.route.ts router.
 *
 * Unlike the old tests/mocks/blockchain.route.mock.js (removed), this
 * mounts the actual route factory from src/api/routes/blockchain.route.ts
 * against a lightweight stub BlockChain object, so a route path or
 * response-shape change in the real file will actually fail these tests.
 */
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const blockchainRouteFactory = require("../src/api/routes/blockchain.route");

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "test-access-token-secret";

const authHeader = () => {
  const token = jwt.sign(
    { username: "admin", roles: ["admin"] },
    ACCESS_TOKEN_SECRET,
  );
  return `Bearer ${token}`;
};

const makeStubBlockchain = (overrides = {}) => ({
  nodeAddress: "3000",
  getChain: jest.fn().mockReturnValue([{ blockHeader: { index: 0 } }]),
  getLengthChain: jest.fn().mockReturnValue(1),
  getPendingTransactions: jest.fn().mockReturnValue([]),
  getTransactions: jest.fn().mockReturnValue([]),
  getBlocks: jest.fn().mockReturnValue([{ blockHeader: { index: 0 } }]),
  getBlockDetails: jest.fn().mockReturnValue({ blockHeader: { index: 0 } }),
  getCitizenRelatedIdentifier: jest.fn().mockResolvedValue("internal-id-1"),
  encryptDataVoter: jest
    .fn()
    .mockReturnValue({ CIPHER_TEXT: "enc-choice", IV: "iv-choice" }),
  encryptDataIdentifier: jest
    .fn()
    .mockReturnValue({ CIPHER_TEXT: "enc-id", IV: "iv-id" }),
  addPendingTransaction: jest
    .fn()
    .mockReturnValue({ transactionHash: "tx-hash-1" }),
  getSmartContractVoters: jest.fn().mockResolvedValue([{ identifier: "v1" }]),
  getSmartContractCandidates: jest
    .fn()
    .mockResolvedValue([{ name: "Candidate 1" }]),
  clearChainsFromStorage: jest.fn().mockResolvedValue([]),
  deployVoters: jest.fn().mockResolvedValue([{ identifier: "v1" }]),
  deployCandidatesBlockchain: jest
    .fn()
    .mockResolvedValue([{ name: "Candidate 1" }]),
  addBlock: jest.fn().mockReturnValue(true),
  mineBlock: jest
    .fn()
    .mockReturnValue({ blockHeader: { blockHash: "new-hash" } }),
  replaceChain: jest.fn().mockReturnValue(true),
  smartContract: {
    getResults: jest
      .fn()
      .mockResolvedValue({ winner: null, totalVotesReceived: 0 }),
    getResultsComputed: jest.fn().mockResolvedValue({ candidates: [] }),
    eraseVoters: jest.fn().mockResolvedValue(undefined),
    eraseResults: jest.fn().mockResolvedValue(undefined),
    getVoters: jest.fn().mockResolvedValue([]),
  },
  ...overrides,
});

const mountRouter = (blockchain, allNodes = []) => {
  const app = express();
  app.use(express.json());
  app.use("/blockchain", blockchainRouteFactory(blockchain, allNodes));
  return app;
};

describe("blockchain.route.ts (real router)", () => {
  test("GET /blockchain/ → chain + length", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("chain");
    expect(res.body.data).toHaveProperty("length", 1);
  });

  test("GET /blockchain/chain → chain + length", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/chain");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("GET /blockchain/pending-transactions → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/pending-transactions");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test("GET /blockchain/blocks → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/blocks");
    expect(res.status).toBe(200);
  });

  test("GET /blockchain/block-detail/:id → 200 when found", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/block-detail/some-hash");
    expect(res.status).toBe(200);
  });

  test("GET /blockchain/block-detail/:id → 404 when not found", async () => {
    const stub = makeStubBlockchain({
      getBlockDetails: jest.fn().mockReturnValue(null),
    });
    const app = mountRouter(stub);
    const res = await request(app).get("/blockchain/block-detail/missing");
    expect(res.status).toBe(404);
  });

  test("GET /blockchain/get-results → 401 without a JWT", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/get-results");
    expect(res.status).toBe(401);
  });

  test("GET /blockchain/get-results → 200 with a valid JWT", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .get("/blockchain/get-results")
      .set("Authorization", authHeader());
    expect(res.status).toBe(200);
  });

  test("GET /blockchain/get-results-computed → 200, unauthenticated", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/get-results-computed");
    expect(res.status).toBe(200);
  });

  test("GET /blockchain/voting-status → 400 without electoralId", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/voting-status");
    expect(res.status).toBe(400);
  });

  test("GET /blockchain/voting-status → 404 for an unknown electoralId", async () => {
    const stub = makeStubBlockchain({
      getCitizenRelatedIdentifier: jest.fn().mockResolvedValue(null),
    });
    const app = mountRouter(stub);
    const res = await request(app)
      .get("/blockchain/voting-status")
      .query({ electoralId: "unknown" });
    expect(res.status).toBe(404);
  });

  test("GET /blockchain/voting-status → hasVoted: false when no matching transaction exists", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .get("/blockchain/voting-status")
      .query({ electoralId: "elector-1" });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ hasVoted: false });
  });

  test("GET /blockchain/voting-status → hasVoted: true when a transaction matches", async () => {
    const stub = makeStubBlockchain({
      getTransactions: jest.fn().mockReturnValue([
        {
          transactionHash: "tx-1",
          identifier: "internal-id-1",
          voteTime: 1700000000000,
        },
      ]),
    });
    const app = mountRouter(stub);
    const res = await request(app)
      .get("/blockchain/voting-status")
      .query({ electoralId: "elector-1" });
    expect(res.status).toBe(200);
    expect(res.body.data.hasVoted).toBe(true);
    expect(res.body.data.transactionHash).toBe("tx-1");
  });

  test("POST /blockchain/transaction → 201 on a valid vote", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/transaction")
      .send({ identifier: "elector-1", choiceCode: "1" });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ transactionHash: "tx-hash-1" });
  });

  test("POST /blockchain/transaction → 400 when identifier is missing", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/transaction")
      .send({ choiceCode: "1" });
    expect(res.status).toBe(400);
  });

  test("POST /blockchain/transaction → 401 when identifier does not resolve", async () => {
    const stub = makeStubBlockchain({
      getCitizenRelatedIdentifier: jest.fn().mockResolvedValue(null),
    });
    const app = mountRouter(stub);
    const res = await request(app)
      .post("/blockchain/transaction")
      .send({ identifier: "unknown-elector", choiceCode: "1" });
    expect(res.status).toBe(401);
  });

  test("POST /blockchain/transaction/broadcast → 200 on valid payload", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/transaction/broadcast")
      .send({
        identifier: "id-1",
        electoralId: "enc-id",
        electoralIdIV: "iv-id",
        choiceCode: "enc-choice",
        IV: "iv-choice",
      });
    expect(res.status).toBe(200);
  });

  test("GET /blockchain/voters → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/voters");
    expect(res.status).toBe(200);
    expect(res.body.data.voters).toEqual([{ identifier: "v1" }]);
  });

  test("GET /blockchain/candidates → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).get("/blockchain/candidates");
    expect(res.status).toBe(200);
  });

  test("DELETE /blockchain/clear-voters → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).delete("/blockchain/clear-voters");
    expect(res.status).toBe(200);
  });

  test("DELETE /blockchain/clear-results → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).delete("/blockchain/clear-results");
    expect(res.status).toBe(200);
  });

  test("DELETE /blockchain/clear-chains → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).delete("/blockchain/clear-chains");
    expect(res.status).toBe(200);
  });

  test("POST /blockchain/deploy-voters → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).post("/blockchain/deploy-voters");
    expect(res.status).toBe(200);
  });

  test("POST /blockchain/deploy-candidates → 200", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).post("/blockchain/deploy-candidates");
    expect(res.status).toBe(200);
  });

  test("POST /blockchain/receive-new-block → 400 on invalid payload", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/receive-new-block")
      .send({});
    expect(res.status).toBe(400);
  });

  test("POST /blockchain/receive-new-block → 200 on a valid block", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/receive-new-block")
      .send({ blockHeader: { blockHash: "abc" } });
    expect(res.status).toBe(200);
  });

  test("POST /blockchain/mine → 200 with the mined block", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app).post("/blockchain/mine");
    expect(res.status).toBe(200);
    expect(res.body.data.block).toEqual({
      blockHeader: { blockHash: "new-hash" },
    });
  });

  test("POST /blockchain/mine → 400 when there is nothing to mine", async () => {
    const stub = makeStubBlockchain({
      mineBlock: jest.fn().mockReturnValue(null),
    });
    const app = mountRouter(stub);
    const res = await request(app).post("/blockchain/mine");
    expect(res.status).toBe(400);
  });

  test("POST /blockchain/synchronize-chain → 200 on a valid chain", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/synchronize-chain")
      .send({ chain: [{ blockHeader: { index: 0 } }] });
    expect(res.status).toBe(200);
  });

  test("POST /blockchain/synchronize-chain → 400 when chain is missing", async () => {
    const app = mountRouter(makeStubBlockchain());
    const res = await request(app)
      .post("/blockchain/synchronize-chain")
      .send({});
    expect(res.status).toBe(400);
  });

  // Regression test: the router used to capture the `allNodes` array by
  // reference at construction time. In the P2P entry point
  // (src/network/network.ts), the node list is reassigned to a brand-new
  // array on every peer join/leave, so the router's broadcast/consensus
  // logic never saw newly-joined peers. The fix accepts either a static
  // array or a live getter function and re-resolves it on every request.
  test("allNodes getter is re-invoked on every request, not frozen at router construction", async () => {
    let callCount = 0;
    const nodes = ["node-a"];
    const getAllNodes = () => {
      callCount++;
      return [...nodes];
    };
    const app = mountRouter(makeStubBlockchain(), getAllNodes);

    await request(app)
      .post("/blockchain/transaction")
      .send({ identifier: "elector-1", choiceCode: "1" });
    expect(callCount).toBeGreaterThan(0);

    const before = callCount;
    nodes.push("node-b"); // simulate a peer joining after construction
    await request(app)
      .post("/blockchain/transaction")
      .send({ identifier: "elector-2", choiceCode: "1" });
    expect(callCount).toBeGreaterThan(before);
  });
});
