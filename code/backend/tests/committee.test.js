/**
 * Comprehensive test suite for the committee module
 */
const Committee = require("../src/committee/committee").default;
const { Role } = require("../src/committee/data_types");
const leveldb = require("../../blockchain/src/leveldb");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

jest.mock("../../blockchain/src/leveldb", () => ({
  readCitizens: jest.fn().mockResolvedValue([]),
  readUsers: jest.fn().mockResolvedValue([]),
  clearVotersGenerated: jest.fn().mockResolvedValue(undefined),
  writeVoterGenerated: jest.fn().mockResolvedValue(undefined),
  clearCandidatesTemp: jest.fn().mockResolvedValue(undefined),
  clearCandidates: jest.fn().mockResolvedValue(undefined),
  writeCandidateTemp: jest.fn().mockResolvedValue(undefined),
  readCandidatesTemp: jest.fn().mockResolvedValue([]),
  readCitizen: jest.fn(),
  readUser: jest.fn(),
  clearCitizens: jest.fn().mockResolvedValue(undefined),
  clearUsers: jest.fn().mockResolvedValue(undefined),
  removeUser: jest.fn().mockResolvedValue(undefined),
  removeCitizen: jest.fn().mockResolvedValue(undefined),
  writeCitizen: jest.fn().mockResolvedValue(undefined),
  writeUser: jest.fn().mockResolvedValue(undefined),
  writeAnnouncement: jest.fn().mockResolvedValue(undefined),
  readAnnouncement: jest.fn().mockResolvedValue({}),
  readVoterGenerated: jest.fn().mockResolvedValue([]),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("speakeasy", () => ({
  generateSecret: jest.fn().mockReturnValue({
    ascii: "test-ascii",
    hex: "test-hex",
    base32: "test-base32",
    otpauth_url: "test-otpauth-url",
  }),
  totp: { verify: jest.fn().mockReturnValue(true) },
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn((_url, callback) =>
    callback(null, "data:image/png;base64,test-qr-code"),
  ),
}));

describe("Committee", () => {
  let committee;

  beforeEach(() => {
    jest.clearAllMocks();
    committee = new Committee();
  });

  describe("Constructor and Initialization", () => {
    test("should initialize with empty arrays", () => {
      expect(committee.citizens).toEqual([]);
      expect(committee.candidates).toEqual([]);
      expect(committee.votersGenerated).toEqual([]);
      expect(committee.users).toEqual([]);
    });

    test("should call readCitizens and readUsers on construction", () => {
      expect(leveldb.readCitizens).toHaveBeenCalled();
      expect(leveldb.readUsers).toHaveBeenCalled();
    });

    test("should log error and keep citizens empty when readCitizens rejects", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.readCitizens.mockRejectedValueOnce(
        new Error("Citizens loading error"),
      );
      const c = new Committee();
      await new Promise((r) => setTimeout(r, 0));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading citizens:",
        expect.objectContaining({ message: "Citizens loading error" }),
      );
      expect(c.citizens).toEqual([]);
      consoleSpy.mockRestore();
    });

    test("should log error and keep users empty when readUsers rejects", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.readUsers.mockRejectedValueOnce(new Error("Users loading error"));
      const c = new Committee();
      await new Promise((r) => setTimeout(r, 0));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading users:",
        expect.objectContaining({ message: "Users loading error" }),
      );
      expect(c.users).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("Simple Getters", () => {
    test("getCitizens should return the citizens array", () => {
      committee.citizens = [{ electoralId: "c1" }];
      expect(committee.getCitizens()).toEqual([{ electoralId: "c1" }]);
    });

    test("getUsers should return the users array", () => {
      committee.users = [{ username: "u1" }];
      expect(committee.getUsers()).toEqual([{ username: "u1" }]);
    });
  });

  describe("getVotersGenerated and getCandidates", () => {
    test("getVotersGenerated should load from DB and return voters", async () => {
      const mockVoters = [{ identifier: "v1" }];
      leveldb.readVoterGenerated.mockResolvedValueOnce(mockVoters);
      const result = await committee.getVotersGenerated();
      expect(leveldb.readVoterGenerated).toHaveBeenCalled();
      expect(result).toEqual(mockVoters);
    });

    test("getVotersGenerated should return cached value on error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      committee.votersGenerated = [{ identifier: "cached" }];
      leveldb.readVoterGenerated.mockRejectedValueOnce(new Error("DB error"));
      const result = await committee.getVotersGenerated();
      expect(result).toEqual([{ identifier: "cached" }]);
      consoleSpy.mockRestore();
    });

    test("getCandidates should load from DB and return candidates", async () => {
      const mockCandidates = [{ name: "Party A", code: 1 }];
      leveldb.readCandidatesTemp.mockResolvedValueOnce(mockCandidates);
      const result = await committee.getCandidates();
      expect(result).toEqual(mockCandidates);
    });

    test("getCandidates should return cached candidates on error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      committee.candidates = [{ name: "cached" }];
      leveldb.readCandidatesTemp.mockRejectedValueOnce(new Error("DB error"));
      const result = await committee.getCandidates();
      expect(result).toEqual([{ name: "cached" }]);
      consoleSpy.mockRestore();
    });
  });

  describe("Identifier Generation", () => {
    test("should generate identifiers only for verified citizens", async () => {
      leveldb.readCitizens.mockResolvedValueOnce([
        { electoralId: "id1", status: "verified" },
        { electoralId: "id2", status: "verified" },
        { electoralId: "id3", status: "pending" },
      ]);
      await committee.loadCitizens();
      const voters = await committee.generateIdentifiers();
      expect(leveldb.clearVotersGenerated).toHaveBeenCalled();
      expect(leveldb.writeVoterGenerated).toHaveBeenCalledTimes(2);
      expect(voters).toHaveLength(2);
      expect(committee.votersGenerated).toEqual(voters);
    });

    test("should return [] and log error when clearVotersGenerated rejects", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.clearVotersGenerated.mockRejectedValueOnce(
        new Error("Generation error"),
      );
      const voters = await committee.generateIdentifiers();
      expect(voters).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error generating identifiers:",
        expect.objectContaining({ message: "Generation error" }),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Candidate Management", () => {
    test("clearCandidates should clear both stores and reset local array", async () => {
      const result = await committee.clearCandidates();
      expect(leveldb.clearCandidatesTemp).toHaveBeenCalled();
      expect(leveldb.clearCandidates).toHaveBeenCalled();
      expect(committee.candidates).toEqual([]);
      expect(result).toEqual([]);
    });

    test("addCandidateCommittee should write and reload candidates", async () => {
      const mockCandidates = [{ name: "Candidate 1", code: 123 }];
      leveldb.readCandidatesTemp.mockResolvedValueOnce(mockCandidates);
      const result = await committee.addCandidateCommittee(
        "Candidate 1",
        123,
        "Party A",
        "PA",
        "active",
      );
      expect(leveldb.writeCandidateTemp).toHaveBeenCalledWith(123, {
        name: "Candidate 1",
        num_votes: 0,
        code: 123,
        acronym: "PA",
        party: "Party A",
        status: "active",
      });
      expect(committee.candidates).toEqual(mockCandidates);
      expect(result).toEqual(mockCandidates);
    });

    test("addCandidateCommittee should return [] and log error on write failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.writeCandidateTemp.mockRejectedValueOnce(
        new Error("Candidate error"),
      );
      const result = await committee.addCandidateCommittee(
        "C",
        1,
        "P",
        "P",
        "active",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error adding candidate:",
        expect.objectContaining({ message: "Candidate error" }),
      );
      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("Authentication", () => {
    test("authMobile should return citizen data on valid credentials", async () => {
      leveldb.readCitizen.mockResolvedValueOnce({
        electoralId: "test-id",
        address: "Addr",
        email: "e@e.com",
        province: "California",
        password: "hashed-password",
      });
      const result = await committee.authMobile("test-id", "password");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        "hashed-password",
      );
      expect(result).toEqual({
        electoralId: "test-id",
        address: "Addr",
        email: "e@e.com",
        province: "California",
      });
    });

    test("authMobile should return null on wrong password", async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      leveldb.readCitizen.mockResolvedValueOnce({ password: "hashed" });
      expect(await committee.authMobile("id", "wrong")).toBeNull();
    });

    test("authMobile should return null when citizen is not found", async () => {
      leveldb.readCitizen.mockResolvedValueOnce(null);
      expect(await committee.authMobile("unknown", "pass")).toBeNull();
    });

    test("authMobile should return null and log error on DB failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.readCitizen.mockRejectedValueOnce(new Error("Auth error"));
      expect(await committee.authMobile("id", "pass")).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Authentication error:",
        expect.objectContaining({ message: "Auth error" }),
      );
      consoleSpy.mockRestore();
    });

    test("authWeb should return user data on valid credentials", async () => {
      leveldb.readUser.mockResolvedValueOnce({
        username: "admin",
        name: "Admin User",
        role: Role.ADMIN,
        password: "hashed-password",
      });
      const result = await committee.authWeb("admin", "password");
      expect(result).toEqual({
        username: "admin",
        name: "Admin User",
        role: Role.ADMIN,
      });
    });

    test("authWeb should return null on wrong password", async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      leveldb.readUser.mockResolvedValueOnce({ password: "hashed" });
      expect(await committee.authWeb("user", "wrong")).toBeNull();
    });

    test("authWeb should return null when user not found", async () => {
      leveldb.readUser.mockResolvedValueOnce(null);
      expect(await committee.authWeb("unknown", "pass")).toBeNull();
    });
  });

  describe("User and Citizen Management", () => {
    test("eraseCitzens should clear DB and reload", async () => {
      await committee.eraseCitzens();
      expect(leveldb.clearCitizens).toHaveBeenCalled();
      expect(leveldb.readCitizens).toHaveBeenCalled();
    });

    test("eraseUsers should clear DB and reload", async () => {
      await committee.eraseUsers();
      expect(leveldb.clearUsers).toHaveBeenCalled();
      expect(leveldb.readUsers).toHaveBeenCalled();
    });

    test("eraseUser should remove specific user and reload", async () => {
      await committee.eraseUser("test-user");
      expect(leveldb.removeUser).toHaveBeenCalledWith("test-user");
      expect(leveldb.readUsers).toHaveBeenCalled();
    });

    test("eraseRegister should remove specific citizen and reload", async () => {
      await committee.eraseRegister("test-id");
      expect(leveldb.removeCitizen).toHaveBeenCalledWith("test-id");
      expect(leveldb.readCitizens).toHaveBeenCalled();
    });

    test("saveCitizen should write citizen by electoralId key", async () => {
      const citizen = { electoralId: "cid-1" };
      await committee.saveCitizen(citizen);
      expect(leveldb.writeCitizen).toHaveBeenCalledWith("cid-1", citizen);
    });

    test("saveUser should write user by username key", async () => {
      const user = { username: "u1" };
      await committee.saveUser(user);
      expect(leveldb.writeUser).toHaveBeenCalledWith("u1", user);
    });

    test("updateTokenCitzen should update refreshToken and persist", async () => {
      committee.citizens = [{ electoralId: "cid-1", refreshToken: "" }];
      await committee.updateTokenCitzen("cid-1", "new-token");
      expect(
        committee.citizens.find((c) => c.electoralId === "cid-1").refreshToken,
      ).toBe("new-token");
      expect(leveldb.writeCitizen).toHaveBeenCalledWith(
        "cid-1",
        expect.objectContaining({ refreshToken: "new-token" }),
      );
    });

    test("updateTokenCitzen should log error when citizen not found", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      committee.citizens = [];
      await committee.updateTokenCitzen("ghost", "tok");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Citizen not found for token update:",
        "ghost",
      );
      expect(leveldb.writeCitizen).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test("updateTokenUser should update refreshToken and persist", async () => {
      committee.users = [{ username: "u1", refreshToken: "" }];
      await committee.updateTokenUser("u1", "user-token");
      expect(leveldb.writeUser).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({ refreshToken: "user-token" }),
      );
    });

    test("updateTokenUser should do nothing when user not found", async () => {
      committee.users = [];
      await committee.updateTokenUser("ghost", "tok");
      expect(leveldb.writeUser).not.toHaveBeenCalled();
    });
  });

  describe("addCitzen", () => {
    test("should add new citizen, hash password, and return true", async () => {
      const data = {
        electoralId: "new-id",
        name: "New Name",
        email: "new@example.com",
        address: "Addr",
        province: "California",
        password: "pass",
      };
      const result = await committee.addCitzen(data);
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(leveldb.writeCitizen).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(committee.citizens).toHaveLength(1);
      expect(committee.citizens[0]).toMatchObject({
        electoralId: "new-id",
        email: "new@example.com",
        status: "pending",
      });
    });

    test("should reject citizen with duplicate email", async () => {
      committee.citizens = [{ email: "dup@example.com" }];
      const result = await committee.addCitzen({
        electoralId: "x",
        email: "dup@example.com",
        password: "p",
      });
      expect(result).toBe(false);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test("should reject citizen with duplicate electoralId", async () => {
      committee.citizens = [{ electoralId: "exists", email: "other@x.com" }];
      const result = await committee.addCitzen({
        electoralId: "exists",
        email: "new@x.com",
        password: "p",
      });
      expect(result).toBe(false);
    });
  });

  describe("addUser", () => {
    test("should add new user with ADMIN role", async () => {
      const data = {
        username: "admin1",
        name: "Admin",
        password: "pass",
        role: "admin",
      };
      const result = await committee.addUser(data);
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(leveldb.writeUser).toHaveBeenCalled();
      const added = result.find((u) => u.username === "admin1");
      expect(added).toBeDefined();
      expect(added.role).toBe(Role.ADMIN);
    });

    test("should add new user with NORMAL role for non-admin role string", async () => {
      const data = {
        username: "normal1",
        name: "Normal",
        password: "pass",
        role: "viewer",
      };
      const result = await committee.addUser(data);
      expect(result).not.toBeNull();
      const added = result.find((u) => u.username === "normal1");
      expect(added).toBeDefined();
      expect(added.role).toBe(Role.NORMAL);
    });

    test("should return null when username already exists", async () => {
      committee.users = [{ username: "dup" }];
      const result = await committee.addUser({
        username: "dup",
        password: "p",
      });
      expect(result).toBeNull();
    });
  });

  describe("updateCitizen", () => {
    test("should update existing citizen fields", async () => {
      const existing = {
        electoralId: "cid-1",
        name: "Old",
        email: "old@x.com",
        address: "Old Addr",
        province: "California",
        status: "pending",
      };
      leveldb.readCitizens.mockResolvedValueOnce([existing]);
      const result = await committee.updateCitizen({
        electoralId: "cid-1",
        name: "New",
        email: "new@x.com",
        address: "New Addr",
        province: "Texas",
        status: "verified",
      });
      expect(result).toBe(true);
      expect(leveldb.writeCitizen).toHaveBeenCalled();
    });

    test("should return false when citizen is not found", async () => {
      leveldb.readCitizens.mockResolvedValueOnce([]);
      const result = await committee.updateCitizen({ electoralId: "ghost" });
      expect(result).toBe(false);
    });

    test("should return false and log error on DB failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.readCitizens.mockRejectedValueOnce(new Error("load error"));
      const result = await committee.updateCitizen({ electoralId: "cid-1" });
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("updateUser", () => {
    test("should update existing user fields", async () => {
      const existing = {
        username: "u1",
        name: "Old",
        role: Role.NORMAL,
        password: "old-hash",
      };
      leveldb.readUsers.mockResolvedValueOnce([existing]);
      const result = await committee.updateUser({
        username: "u1",
        name: "New",
        role: "admin",
      });
      expect(result).toBe(true);
      expect(leveldb.writeUser).toHaveBeenCalled();
    });

    test("should hash new password when provided during update", async () => {
      const existing = {
        username: "u1",
        name: "U",
        role: Role.NORMAL,
        password: "old",
      };
      leveldb.readUsers.mockResolvedValueOnce([existing]);
      await committee.updateUser({
        username: "u1",
        name: "U",
        role: "admin",
        password: "newpass",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
    });

    test("should return false when user is not found", async () => {
      leveldb.readUsers.mockResolvedValueOnce([]);
      const result = await committee.updateUser({ username: "ghost" });
      expect(result).toBe(false);
    });
  });

  describe("OTP and QR Code Generation", () => {
    test("generateOtp should call speakeasy with correct options", () => {
      const otp = committee.generateOtp();
      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: "Election QuantumBallot",
        length: 6,
        step: 300,
      });
      expect(otp).toEqual({
        ascii: "test-ascii",
        hex: "test-hex",
        base32: "test-base32",
        otpauth_url: "test-otpauth-url",
      });
    });

    test("verifyOtp should call speakeasy.totp.verify and return true", () => {
      const result = committee.verifyOtp("secret-base32", "123456");
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: "secret-base32",
        encoding: "base32",
        token: "123456",
      });
      expect(result).toBe(true);
    });

    test("verifyOtp should return false and log error when speakeasy throws", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      speakeasy.totp.verify.mockImplementationOnce(() => {
        throw new Error("OTP error");
      });
      expect(committee.verifyOtp("secret", "000000")).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying OTP:",
        expect.objectContaining({ message: "OTP error" }),
      );
      consoleSpy.mockRestore();
    });

    test("generateQRCode should resolve with base64 data URL", async () => {
      const qr = await committee.generateQRCode("test-otpauth-url");
      expect(qrcode.toDataURL).toHaveBeenCalledWith(
        "test-otpauth-url",
        expect.any(Function),
      );
      expect(qr).toBe("data:image/png;base64,test-qr-code");
    });

    test("generateQRCode should return null and log error on qrcode failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      qrcode.toDataURL.mockImplementationOnce((_url, callback) =>
        callback(new Error("QR error"), null),
      );
      const qr = await committee.generateQRCode("url");
      expect(qr).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to generate QR code:",
        expect.objectContaining({ message: "QR error" }),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("Announcement Management", () => {
    test("deployAnnouncement should parse numbers, write, and return announcement", async () => {
      const data = {
        startTimeVoting: "2024-01-01",
        endTimeVoting: "2024-01-02",
        dateResults: "2024-01-03",
        numOfCandidates: "5",
        numOfVoters: "100",
      };
      const result = await committee.deployAnnouncement(data);
      expect(leveldb.writeAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({
          numOfCandidates: 5,
          numOfVoters: 100,
          dateCreated: expect.any(Number),
        }),
      );
      expect(result).toEqual(committee.announcement);
    });

    test("deployAnnouncement should return null and log on write failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      leveldb.writeAnnouncement.mockRejectedValueOnce(new Error("Write error"));
      const result = await committee.deployAnnouncement({});
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deploying announcement:",
        expect.objectContaining({ message: "Write error" }),
      );
      consoleSpy.mockRestore();
    });

    test("getAnnouncement should load from DB and return the announcement", async () => {
      const mock = { startTimeVoting: "2024-01-01" };
      leveldb.readAnnouncement.mockResolvedValueOnce(mock);
      const result = await committee.getAnnouncement();
      expect(leveldb.readAnnouncement).toHaveBeenCalled();
      expect(result).toEqual(mock);
      expect(committee.announcement).toEqual(mock);
    });
  });
});
