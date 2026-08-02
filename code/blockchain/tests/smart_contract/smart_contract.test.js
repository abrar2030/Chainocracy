/**
 * Comprehensive test suite for the SmartContract module
 */
const leveldb = require("../../src/leveldb");
const SmartContract =
  require("../../src/smart_contract/smart_contract").default;

jest.mock("../../src/crypto/cryptoBlockchain", () =>
  jest.fn().mockImplementation(() => ({
    decryptData: jest.fn((data) => {
      if (data.CIPHER_TEXT === "encrypted_electoral_id")
        return "decrypted_electoral_id";
      if (data.CIPHER_TEXT === "encrypted_choice_code") return "PARTY1";
      return "";
    }),
  })),
);

jest.mock("../../src/leveldb", () => ({
  readAnnouncement: jest.fn(),
  readCandidates: jest.fn(),
  readCitizens: jest.fn(),
  readResults: jest.fn(),
  readVoters: jest.fn(),
  writeResults: jest.fn(),
  clearVoters: jest.fn(),
  clearResults: jest.fn(),
  clearVoterCitizenRelation: jest.fn(),
}));

describe("SmartContract", () => {
  let smartContract;
  let mockAnnouncement;
  let mockCandidates;
  let mockVoters;
  let mockCitizens;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAnnouncement = {
      startTimeVoting: new Date(Date.now() - 3_600_000).toISOString(),
      endTimeVoting: new Date(Date.now() + 3_600_000).toISOString(),
      numOfVoters: 100,
      numOfCandidates: 3,
    };

    mockCandidates = [
      { code: "PARTY1", party: "Party1", num_votes: 0 },
      { code: "PARTY2", party: "Party2", num_votes: 0 },
      { code: "PARTY3", party: "Party3", num_votes: 0 },
    ];

    mockVoters = [
      {
        identifier: "12345",
        electoralId: "encrypted_electoral_id",
        electoralIV: "iv_value",
        choiceCode: "encrypted_choice_code",
        IV: "iv_value",
        state: false,
        voteTime: new Date().toISOString(),
      },
    ];

    mockCitizens = [
      { electoralId: "decrypted_electoral_id", province: "California" },
    ];

    leveldb.readAnnouncement.mockResolvedValue(mockAnnouncement);
    leveldb.readCandidates.mockResolvedValue(mockCandidates);
    leveldb.readVoters.mockResolvedValue(mockVoters);
    leveldb.readCitizens.mockResolvedValue(mockCitizens);
    leveldb.readResults.mockResolvedValue(null);
    leveldb.writeResults.mockResolvedValue(undefined);
    leveldb.clearVoters.mockResolvedValue(undefined);
    leveldb.clearResults.mockResolvedValue(undefined);
    leveldb.clearVoterCitizenRelation.mockResolvedValue(undefined);

    smartContract = new SmartContract();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should expose electionState and provinces", () => {
      expect(smartContract.electionState).toBeDefined();
      expect(smartContract.provinces).toHaveLength(50);
    });

    test("should load announcement via getAnnouncement()", async () => {
      const ann = await smartContract.getAnnouncement();
      expect(ann).toEqual(mockAnnouncement);
    });

    test("should start with empty processedVotes set", () => {
      expect(smartContract.processedVotes.size).toBe(0);
    });
  });

  describe("isElectionState", () => {
    test("should return true when election is in Started/Happening/Ended state", () => {
      smartContract.update();
      expect(smartContract.isElectionState()).toBe(true);
    });

    test("should return false when state is Created (0)", () => {
      smartContract.electionState = 0;
      expect(smartContract.isElectionState()).toBe(false);
    });
  });

  describe("isValidElectionTime", () => {
    test("should return true when current time is within election window", async () => {
      await smartContract.getAnnouncement();
      expect(smartContract.isValidElectionTime()).toBe(true);
    });

    test("should return false when election period has already ended", async () => {
      leveldb.readAnnouncement.mockResolvedValueOnce({
        ...mockAnnouncement,
        startTimeVoting: new Date(Date.now() - 7_200_000).toISOString(),
        endTimeVoting: new Date(Date.now() - 3_600_000).toISOString(),
      });
      await smartContract.getAnnouncement();
      expect(smartContract.isValidElectionTime()).toBe(false);
    });

    test("should return false when election has not started yet", async () => {
      leveldb.readAnnouncement.mockResolvedValueOnce({
        ...mockAnnouncement,
        startTimeVoting: new Date(Date.now() + 3_600_000).toISOString(),
        endTimeVoting: new Date(Date.now() + 7_200_000).toISOString(),
      });
      await smartContract.getAnnouncement();
      expect(smartContract.isValidElectionTime()).toBe(false);
    });

    test("should return false when announcement is not set", () => {
      smartContract.announcement = null;
      expect(smartContract.isValidElectionTime()).toBe(false);
    });

    test("should return false for invalid date strings in announcement", async () => {
      leveldb.readAnnouncement.mockResolvedValueOnce({
        startTimeVoting: "not-a-date",
        endTimeVoting: "also-not-a-date",
      });
      await smartContract.getAnnouncement();
      expect(smartContract.isValidElectionTime()).toBe(false);
    });
  });

  describe("getVoters and getCandidates", () => {
    test("getVoters should return voters from the DB", async () => {
      const voters = await smartContract.getVoters();
      expect(voters).toEqual(mockVoters);
    });

    test("getCandidates should return candidates from the DB", async () => {
      const candidates = await smartContract.getCandidates();
      expect(candidates).toEqual(mockCandidates);
    });

    test("getVoters should return [] on error", async () => {
      leveldb.readVoters.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const voters = await smartContract.getVoters();
      expect(voters).toEqual([]);
      consoleSpy.mockRestore();
    });

    test("getCandidates should return [] on error", async () => {
      leveldb.readCandidates.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const candidates = await smartContract.getCandidates();
      expect(candidates).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("Data loading error handling", () => {
    test("loadCandidates should resolve with [] on DB error", async () => {
      leveldb.readCandidates.mockRejectedValueOnce(new Error("Database error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(smartContract.loadCandidates()).resolves.toEqual([]);
      consoleSpy.mockRestore();
    });

    test("loadVoters should resolve with [] on DB error", async () => {
      leveldb.readVoters.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(smartContract.loadVoters()).resolves.toEqual([]);
      consoleSpy.mockRestore();
    });

    test("loadCitizens should resolve with [] on DB error", async () => {
      leveldb.readCitizens.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(smartContract.loadCitizens()).resolves.toEqual([]);
      consoleSpy.mockRestore();
    });

    test("loadAnnouncement should resolve with null on DB error", async () => {
      leveldb.readAnnouncement.mockRejectedValueOnce(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await expect(smartContract.loadAnnouncement()).resolves.toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe("existsVoter and existsCandidate", () => {
    beforeEach(() => {
      smartContract.hashVoters = { voter123: mockVoters[0] };
      smartContract.hashCandidates = { PARTY1: mockCandidates[0] };
    });

    test("existsVoter should return true when voter identifier is in hashVoters", async () => {
      expect(await smartContract.existsVoter({ identifier: "voter123" })).toBe(
        true,
      );
    });

    test("existsVoter should return false when identifier is not in hashVoters", async () => {
      expect(await smartContract.existsVoter({ identifier: "unknown" })).toBe(
        false,
      );
    });

    test("existsVoter should return false for voter with no identifier", async () => {
      expect(await smartContract.existsVoter({})).toBe(false);
    });

    test("existsCandidate should return true for a known candidate code", () => {
      expect(smartContract.existsCandidate("PARTY1")).toBe(true);
    });

    test("existsCandidate should return false for unknown code", () => {
      expect(smartContract.existsCandidate("GHOST")).toBe(false);
    });

    test("existsCandidate should return false for empty/null code", () => {
      expect(smartContract.existsCandidate("")).toBe(false);
      expect(smartContract.existsCandidate(null)).toBe(false);
    });
  });

  describe("revealVoter", () => {
    test("should decrypt and return voter electoral ID + identifier", () => {
      const result = smartContract.revealVoter(mockVoters[0]);
      expect(result).toEqual({
        electoralId: "decrypted_electoral_id",
        identifier: "12345",
      });
    });

    test("should throw when voter has missing electoralIV", () => {
      expect(() =>
        smartContract.revealVoter({ identifier: "12345" }),
      ).toThrow();
    });
  });

  describe("winningCandidate", () => {
    test("should return null when all candidates have 0 votes", () => {
      smartContract.candidates = mockCandidates;
      expect(smartContract.winningCandidate()).toBeNull();
    });

    test("should return the candidate with the most votes", () => {
      smartContract.candidates = [
        { code: "PARTY1", party: "Party1", num_votes: 10 },
        { code: "PARTY2", party: "Party2", num_votes: 5 },
        { code: "PARTY3", party: "Party3", num_votes: 3 },
      ];
      expect(smartContract.winningCandidate().code).toBe("PARTY1");
    });

    test("should return null on a tie", () => {
      smartContract.candidates = [
        { code: "PARTY1", party: "Party1", num_votes: 10 },
        { code: "PARTY2", party: "Party2", num_votes: 10 },
        { code: "PARTY3", party: "Party3", num_votes: 3 },
      ];
      expect(smartContract.winningCandidate()).toBeNull();
    });

    test("should return null when candidate list is empty", () => {
      smartContract.candidates = [];
      expect(smartContract.winningCandidate()).toBeNull();
    });
  });

  describe("eraseVoters and eraseResults", () => {
    test("eraseVoters should call clearVoters and loadVoters", async () => {
      await smartContract.eraseVoters();
      expect(leveldb.clearVoters).toHaveBeenCalled();
    });

    test("eraseVoters should clear processedVotes set", async () => {
      smartContract.processedVotes.add("some-id");
      await smartContract.eraseVoters();
      expect(smartContract.processedVotes.size).toBe(0);
    });

    test("eraseResults should call clearResults and set results to null", async () => {
      await smartContract.eraseResults();
      expect(leveldb.clearResults).toHaveBeenCalled();
      expect(smartContract.results).toBeNull();
    });
  });

  describe("getResults", () => {
    test("should process votes, write results to DB, and return them", async () => {
      await smartContract.getResults();
      expect(leveldb.writeResults).toHaveBeenCalled();
    });
  });

  describe("getResultsComputed", () => {
    test("should call initVariables and return current results without reprocessing", async () => {
      smartContract.results = { winner: null, totalVotesReceived: 0 };
      await smartContract.getResultsComputed();
      expect(leveldb.readResults).toHaveBeenCalled();
    });
  });
});
