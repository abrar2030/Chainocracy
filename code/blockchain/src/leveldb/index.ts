import * as fs from "node:fs";
import * as path from "node:path";
import type { Block, Candidate, Voter } from "../core/data_types";
import type { Citizen, User } from "../../../backend/src/committee/data_types";

const NODE_ADDRESS = process.argv[2] || "3000";
const getBlockAddress = (str: string) => str + NODE_ADDRESS;

const { Level } = require("level");

const DB_PATH = process.env.DB_PATH || "./data/QuantumBallot_db";
const dbPath = getBlockAddress(DB_PATH);

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Level(dbPath, { valueEncoding: "json" });
db.setMaxListeners(20);

const BLOCK = getBlockAddress("block");
const CHAIN = getBlockAddress("chain");
const USER_COMMITTEE = getBlockAddress("user_committee");
const TRANSACTION = getBlockAddress("transaction");
const CITIZENS = getBlockAddress("citizens");
const CANDIDATES = getBlockAddress("candidates");
const CANDIDATES_TEMP = getBlockAddress("candidates_temp");
const VOTERS = getBlockAddress("voters");
const VOTERS_GENERATED = getBlockAddress("voters_generated");
const ANNOUNCEMENT = getBlockAddress("announcement");
const RESULTS = getBlockAddress("results");
const VOTER_CITIZEN_RELATION = getBlockAddress("voter_citizen_relation");

const blockdb = db.sublevel(BLOCK, { valueEncoding: "json" });
const chaindb = db.sublevel(CHAIN, { valueEncoding: "json" });
const transactiondb = db.sublevel(TRANSACTION, { valueEncoding: "json" });
const citizensdb = db.sublevel(CITIZENS, { valueEncoding: "json" });
const candidatesdb = db.sublevel(CANDIDATES, { valueEncoding: "json" });
const votersdb = db.sublevel(VOTERS, { valueEncoding: "json" });
const votersgenerateddb = db.sublevel(VOTERS_GENERATED, {
  valueEncoding: "json",
});
const candidatesTempDb = db.sublevel(CANDIDATES_TEMP, {
  valueEncoding: "json",
});
const userdb = db.sublevel(USER_COMMITTEE, { valueEncoding: "json" });
const announcementdb = db.sublevel(ANNOUNCEMENT, { valueEncoding: "json" });
const resultsdb = db.sublevel(RESULTS, { valueEncoding: "json" });
const votercitizenrelationdb = db.sublevel(VOTER_CITIZEN_RELATION, {
  valueEncoding: "json",
});

// ── Connection ────────────────────────────────────────────────────────────────

export async function connectToDB(): Promise<void> {
  // In level v8, db.open() on an already-open database is idempotent and
  // resolves without error, so no special handling is needed for that case.
  // We propagate all genuine errors (permissions, disk, lock conflicts, etc.)
  try {
    await db.open();
    console.log(`LevelDB connected at: ${dbPath}`);
  } catch (error: any) {
    // LEVEL_ALREADY_OPEN is returned if somehow open() is called concurrently;
    // treat it as success. All other errors are fatal.
    if ((error as any).code === "LEVEL_ALREADY_OPEN") {
      console.log(`LevelDB already open at: ${dbPath}`);
      return;
    }
    console.error("Failed to connect to LevelDB:", error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  try {
    await db.close();
    console.log("LevelDB connection closed");
  } catch (error: unknown) {
    console.error("Error closing LevelDB:", error);
    throw error;
  }
}

export function getDB() {
  return db;
}

// ── Writes ────────────────────────────────────────────────────────────────────

export async function writeTransaction(key: string, value: any) {
  await transactiondb.put(key, value);
}

export async function writeChain(value: Block[]) {
  await chaindb.put(CHAIN, value);
  for (const block of value) {
    await writeBlock(block.blockHeader.blockHash, block);
  }
}

export async function writeBlock(key: string, value: any) {
  await blockdb.put(key, value);
}

export async function writeCitizen(key: string, value: any) {
  await citizensdb.put(key, value);
}

export async function writeUser(key: string, value: any) {
  await userdb.put(key, value);
}

export async function writeAnnouncement(value: any) {
  await announcementdb.put(ANNOUNCEMENT, value);
}

export async function writeResults(value: any) {
  await resultsdb.put(RESULTS, value);
}

export async function writeVoterGenerated(key: string, value: any) {
  await votersgenerateddb.put(key, value);
}

export async function writeVoterCitizenRelation(key: string, value: any) {
  await votercitizenrelationdb.put(key, value);
}

export async function writeCandidateTemp(key: string | number, value: any) {
  await candidatesTempDb.put(String(key), value);
}

export async function updateVoter(key: string, value: any) {
  await votersdb.put(key, value);
}

// ── Deploy helpers ────────────────────────────────────────────────────────────

export async function deployVotersGenerated() {
  await clearVoters();
  for await (const [key, value] of votersgenerateddb.iterator()) {
    if (value !== undefined) {
      await votersdb.put(key, value);
      await writeVoterCitizenRelation(value.electoralId, value.identifier);
    }
  }
}

export async function deployCandidates() {
  await clearCandidates();
  for await (const [key, value] of candidatesTempDb.iterator()) {
    if (value !== undefined) {
      await candidatesdb.put(key, value);
    }
  }
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function readVoters(): Promise<Voter[]> {
  const voters: Voter[] = [];
  for await (const [, value] of votersdb.iterator()) {
    if (value !== undefined) voters.push(value);
  }
  return voters;
}

export async function readCandidatesTemp(): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  for await (const [, value] of candidatesTempDb.iterator()) {
    if (value !== undefined) candidates.push(value);
  }
  return candidates;
}

export async function readCandidates(): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  for await (const [, value] of candidatesdb.iterator()) {
    if (value !== undefined) candidates.push(value);
  }
  return candidates;
}

export async function readUsers(): Promise<User[]> {
  const users: User[] = [];
  for await (const [, value] of userdb.iterator()) {
    if (value !== undefined) users.push(value);
  }
  return users;
}

export async function readVoterGenerated(): Promise<Voter[]> {
  const votersGenerated: Voter[] = [];
  for await (const [, value] of votersgenerateddb.iterator()) {
    if (value !== undefined) votersGenerated.push(value);
  }
  return votersGenerated;
}

export async function readBlock(key: string) {
  return blockdb.get(key);
}

export async function readChain(): Promise<Block[]> {
  try {
    return await chaindb.get(CHAIN);
  } catch (error: any) {
    if ((error as any).code === "LEVEL_NOT_FOUND") return [];
    throw error;
  }
}

export async function readVoterCitizenRelation(key: string): Promise<string> {
  return votercitizenrelationdb.get(key);
}

export async function readAnnouncement() {
  try {
    return await announcementdb.get(ANNOUNCEMENT);
  } catch (error: any) {
    if ((error as any).code === "LEVEL_NOT_FOUND") return null;
    throw error;
  }
}

export async function readResults() {
  try {
    return await resultsdb.get(RESULTS);
  } catch (error: any) {
    if ((error as any).code === "LEVEL_NOT_FOUND") return null;
    throw error;
  }
}

export async function readTransactions() {
  const transactions = [];
  for await (const [, value] of transactiondb.iterator()) {
    transactions.push(value);
  }
  return transactions;
}

export async function readCitizen(key: string) {
  try {
    return await citizensdb.get(key);
  } catch (error: any) {
    if ((error as any).code === "LEVEL_NOT_FOUND") return null;
    throw error;
  }
}

export async function readUser(key: string) {
  try {
    return await userdb.get(key);
  } catch (error: any) {
    if ((error as any).code === "LEVEL_NOT_FOUND") return null;
    throw error;
  }
}

export async function readCitizens(): Promise<Citizen[]> {
  const citizens: Citizen[] = [];
  for await (const [, value] of citizensdb.iterator()) {
    if (value !== undefined) citizens.push(value);
  }
  return citizens;
}

export async function readBlocks(): Promise<Block[]> {
  const blocks: Block[] = [];
  for await (const [, value] of blockdb.iterator()) {
    if (value !== undefined) blocks.push(value);
  }
  return blocks;
}

// ── Deletes / Clears ──────────────────────────────────────────────────────────

export async function removeUser(key: string) {
  return userdb.del(key);
}
export async function removeCitizen(key: string) {
  return citizensdb.del(key);
}
export async function clearCitizens() {
  return citizensdb.clear();
}
export async function clearUsers() {
  return userdb.clear();
}
export async function clearResults() {
  return resultsdb.clear();
}
export async function clearCandidates() {
  return candidatesdb.clear();
}
export async function clearCandidatesTemp() {
  return candidatesTempDb.clear();
}
export async function clearVotersGenerated() {
  return votersgenerateddb.clear();
}
export async function clearVoterCitizenRelation() {
  return votercitizenrelationdb.clear();
}

export async function clearChains() {
  await chaindb.clear();
  return blockdb.clear();
}

export async function clearVoters() {
  await clearVoterCitizenRelation();
  return votersdb.clear();
}
