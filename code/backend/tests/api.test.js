/**
 * API Routes tests using mock implementations
 */
const request = require("supertest");
const express = require("express");
const blockchainRoutes = require("./mocks/blockchain.route.mock");
const committeeRoutes = require("./mocks/committee.route.mock");

describe("API Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/blockchain", blockchainRoutes);
    app.use("/committee", committeeRoutes);
  });

  // ─── Blockchain Routes ────────────────────────────────────────────────────

  describe("Blockchain Routes", () => {
    test("GET /blockchain/blocks → 200 with block list", async () => {
      const res = await request(app).get("/blockchain/blocks");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1, blockHash: "test-hash" }]);
    });

    test("GET /blockchain/transactions → 200 with transaction list", async () => {
      const res = await request(app).get("/blockchain/transactions");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1, identifier: "test-id" }]);
    });

    test("GET /blockchain/pending-transactions → 200 with empty array", async () => {
      const res = await request(app).get("/blockchain/pending-transactions");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("GET /blockchain/block/:blockHash → 200 with block details", async () => {
      const res = await request(app).get("/blockchain/block/test-hash");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ blockIndex: 1, transactions: [] });
    });

    test("POST /blockchain/mine → 201 with new block", async () => {
      const res = await request(app).post("/blockchain/mine");
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ blockIndex: 2 });
    });

    test("POST /blockchain/add-transaction → 201 with transaction hash", async () => {
      const res = await request(app).post("/blockchain/add-transaction").send({
        identifier: "test-id",
        electoralId: "electoral-id",
        electoralIdIV: "iv",
        choiceCode: "choice",
        choiceCodeIV: "choice-iv",
        secret: "secret",
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ transactionHash: "test-hash" });
    });

    test("POST /blockchain/add-transaction → 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/blockchain/add-transaction")
        .send({ identifier: "only-id" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing required fields" });
    });

    test("POST /blockchain/add-transaction → 400 for completely empty body", async () => {
      const res = await request(app)
        .post("/blockchain/add-transaction")
        .send({});
      expect(res.status).toBe(400);
    });

    test("GET /blockchain/smart-contract/voters → 200 with voter list", async () => {
      const res = await request(app).get("/blockchain/smart-contract/voters");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ identifier: "voter-1" }]);
    });

    test("GET /blockchain/smart-contract/candidates → 200 with candidate list", async () => {
      const res = await request(app).get(
        "/blockchain/smart-contract/candidates",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ name: "Candidate 1" }]);
    });

    test("POST /blockchain/deploy-voters → 200 with deployed voters", async () => {
      const res = await request(app).post("/blockchain/deploy-voters");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ identifier: "voter-1" }]);
    });

    test("POST /blockchain/deploy-candidates → 200 with deployed candidates", async () => {
      const res = await request(app).post("/blockchain/deploy-candidates");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ name: "Candidate 1" }]);
    });

    test("DELETE /blockchain/clear-chains → 200 with empty array", async () => {
      const res = await request(app).delete("/blockchain/clear-chains");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("GET /blockchain/citizen-identifier/:electoralId → 200 with identifier", async () => {
      const res = await request(app).get(
        "/blockchain/citizen-identifier/electoral-123",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ identifier: "test-identifier" });
    });
  });

  // ─── Committee Routes ─────────────────────────────────────────────────────

  describe("Committee Routes", () => {
    test("GET /committee/citizens → 200 with citizen list", async () => {
      const res = await request(app).get("/committee/citizens");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ electoralId: "citizen-1" }]);
    });

    test("GET /committee/users → 200 with user list", async () => {
      const res = await request(app).get("/committee/users");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ username: "user-1" }]);
    });

    test("GET /committee/voters-generated → 200 with voter list", async () => {
      const res = await request(app).get("/committee/voters-generated");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ identifier: "voter-1" }]);
    });

    test("GET /committee/candidates → 200 with candidate list", async () => {
      const res = await request(app).get("/committee/candidates");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ name: "Candidate 1" }]);
    });

    // Auth
    test("POST /committee/auth/mobile → 200 with tokens and user", async () => {
      const res = await request(app).post("/committee/auth/mobile").send({
        electoralId: "citizen-1",
        password: "password",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).toEqual({ electoralId: "citizen-1" });
    });

    test("POST /committee/auth/web → 200 with tokens and user", async () => {
      const res = await request(app).post("/committee/auth/web").send({
        username: "user-1",
        password: "password",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).toEqual({ username: "user-1", role: "admin" });
    });

    // Add operations
    test("POST /committee/add-citizen → 201 on success", async () => {
      const res = await request(app).post("/committee/add-citizen").send({
        electoralId: "new-citizen",
        name: "New Citizen",
        email: "new@example.com",
        address: "Address",
        province: "California",
        password: "pass",
      });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true });
    });

    test("POST /committee/add-user → 201 with user list", async () => {
      const res = await request(app).post("/committee/add-user").send({
        username: "new-user",
        name: "New User",
        password: "pass",
        role: "admin",
      });
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /committee/add-candidate → 200 with candidates when all fields present", async () => {
      const res = await request(app).post("/committee/add-candidate").send({
        name: "Party A",
        code: 1,
        party: "Party A Full",
        acronym: "PA",
        status: "active",
      });
      expect(res.status).toBe(200);
    });

    test("POST /committee/add-candidate → 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/committee/add-candidate")
        .send({ name: "only-name" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing required fields" });
    });

    // Update operations
    test("PUT /committee/update-citizen → 200 on success", async () => {
      const res = await request(app).put("/committee/update-citizen").send({
        electoralId: "cid-1",
        name: "Updated",
        status: "verified",
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });

    test("PUT /committee/update-user → 200 on success", async () => {
      const res = await request(app).put("/committee/update-user").send({
        username: "u1",
        name: "Updated User",
        role: "admin",
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });

    // Delete operations
    test("DELETE /committee/citizens → 200", async () => {
      const res = await request(app).delete("/committee/citizens");
      expect(res.status).toBe(200);
    });

    test("DELETE /committee/users → 200", async () => {
      const res = await request(app).delete("/committee/users");
      expect(res.status).toBe(200);
    });

    test("DELETE /committee/user/:username → 200", async () => {
      const res = await request(app).delete("/committee/user/admin1");
      expect(res.status).toBe(200);
    });

    test("DELETE /committee/citizen/:electoralId → 200", async () => {
      const res = await request(app).delete("/committee/citizen/cid-1");
      expect(res.status).toBe(200);
    });

    test("DELETE /committee/clear-candidates → 200 with empty array", async () => {
      const res = await request(app).delete("/committee/clear-candidates");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    // Generate identifiers
    test("POST /committee/generate-identifiers → 200 with identifier list", async () => {
      const res = await request(app).post("/committee/generate-identifiers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    // Announcement
    test("POST /committee/announcement → 200 with announcement object", async () => {
      const res = await request(app).post("/committee/announcement").send({
        startTimeVoting: "2024-01-01",
        endTimeVoting: "2024-01-02",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("startTimeVoting");
    });

    test("GET /committee/announcement → 200 with announcement object", async () => {
      const res = await request(app).get("/committee/announcement");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("startTimeVoting");
    });

    // OTP
    test("POST /committee/verify-otp → 200 with verified: true", async () => {
      const res = await request(app).post("/committee/verify-otp").send({
        secret: "base32-secret",
        token: "123456",
      });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ verified: true });
    });
  });
});
