import type {
  Candidate,
  CandidateResult,
  HashMap,
  Results,
  Voter,
} from "../core/data_types";
import type {
  Announcement,
  Citizen,
} from "../../../backend/src/committee/data_types";
import CryptoBlockchain from "../crypto/cryptoBlockchain";
import {
  clearResults,
  clearVoters,
  readAnnouncement,
  readCandidates,
  readCitizens,
  readResults,
  readVoters,
  writeResults,
} from "../leveldb";

let _CryptoBlockIdentifier: CryptoBlockchain | null = null;
let _CryptoBlockVote: CryptoBlockchain | null = null;

const getCryptoBlockIdentifier = () => {
  if (!_CryptoBlockIdentifier) {
    _CryptoBlockIdentifier = new CryptoBlockchain(
      process.env.SECRET_KEY_IDENTIFIER || "",
      process.env.SECRET_IV_IDENTIFIER || "",
    );
  }
  return _CryptoBlockIdentifier;
};

const getCryptoBlockVote = () => {
  if (!_CryptoBlockVote) {
    _CryptoBlockVote = new CryptoBlockchain(
      process.env.SECRET_KEY_VOTES || "",
      process.env.SECRET_IV_VOTES || "",
    );
  }
  return _CryptoBlockVote;
};

enum ElectionState {
  Created = 0,
  Announced,
  Started,
  Happening,
  Ended,
}

class SmartContract {
  public candidates!: Candidate[];
  public candidatesTest!: Candidate[];
  public voters!: Voter[];
  public votersTest!: Voter[];
  public citizens!: Citizen[];
  public hashCandidates!: HashMap<Candidate>;
  public hashVoters!: HashMap<Voter>;
  public electionState: ElectionState;
  public announcement!: Announcement;
  public provinces!: string[];
  public results!: Results;
  public statsPerProvince!: HashMap<HashMap<number>>;
  public processedVotes: Set<string>;

  constructor() {
    this.electionState = ElectionState.Created;
    this.processedVotes = new Set<string>();
    this.initVariables();
    this.update();
  }

  public update() {
    // initVariables is async; attach rejection handler so errors surface in logs.
    // electionState is set synchronously so the blockchain can keep accepting
    // transactions while data reloads in the background.
    this.initVariables().catch((e: unknown) =>
      console.error("Error reloading smart contract state:", e),
    );
    this.electionState = ElectionState.Started;
  }

  public async initVariables() {
    this.candidates = [];
    this.voters = [];
    this.citizens = [];
    this.provinces = [
      "Bengo",
      "Benguela",
      "Bié",
      "Cabinda",
      "Cuando Cubango",
      "Cuanza Norte",
      "Cuanza Sul",
      "Cunene",
      "Huambo",
      "Huíla",
      "Luanda",
      "Lunda Norte",
      "Lunda Sul",
      "Malanje",
      "Moxico",
      "Namibe",
      "Uíge",
      "Zaire",
    ];
    this.hashCandidates = {};
    this.hashVoters = {};

    try {
      await Promise.all([
        this.loadCandidates(),
        this.loadVoters(),
        this.loadAnnouncement(),
        this.loadCitizens(),
        this.loadResults(),
      ]);
    } catch (error: unknown) {
      console.error("Error initializing variables:", error);
    }

    this.statsPerProvince = {};
    this.provinces.forEach((p) => {
      const map: HashMap<number> = {};
      this.candidates.forEach((c) => {
        map[c.party] = 0;
      });
      map.sum = 0;
      this.statsPerProvince[p] = map;
    });
  }

  public async loadCitizens() {
    try {
      this.citizens = await readCitizens();
      return this.citizens;
    } catch (error: unknown) {
      console.error("Error loading citizens:", error);
      this.citizens = [];
      return [];
    }
  }

  public async loadAnnouncement() {
    try {
      this.announcement = await readAnnouncement();
      return this.announcement;
    } catch (error: unknown) {
      console.error("Error loading announcement:", error);
      return null;
    }
  }

  public async loadResults() {
    try {
      this.results = await readResults();
      return this.results;
    } catch (error: unknown) {
      console.error("Error loading results:", error);
      return null;
    }
  }

  public async loadVoters(): Promise<Voter[]> {
    try {
      this.voters = await readVoters();
      return this.voters;
    } catch (error: unknown) {
      console.error("Error loading voters:", error);
      this.voters = [];
      return [];
    }
  }

  public async loadCandidates(): Promise<Candidate[]> {
    try {
      this.candidates = await readCandidates();
      return this.candidates;
    } catch (error: unknown) {
      console.error("Error loading candidates:", error);
      this.candidates = [];
      return [];
    }
  }

  public async getAnnouncement() {
    try {
      this.announcement = await readAnnouncement();
    } catch (error: unknown) {
      console.error("Error getting announcement:", error);
    }
    return this.announcement;
  }

  public isValidElectionTime(): boolean {
    if (!this.announcement) return false;
    const currentTime = Date.now();
    const startTime = new Date(this.announcement.startTimeVoting).getTime();
    const endTime = new Date(this.announcement.endTimeVoting).getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      console.error("Invalid date format in announcement");
      return false;
    }
    return (
      this.isElectionState() &&
      currentTime >= startTime &&
      currentTime <= endTime
    );
  }

  public isElectionState(): boolean {
    return (
      this.electionState >= ElectionState.Started &&
      this.electionState <= ElectionState.Ended
    );
  }

  public async getVoters() {
    try {
      this.votersTest = await readVoters();
    } catch (error: unknown) {
      console.error("Error getting voters:", error);
      this.votersTest = [];
    }
    return this.votersTest;
  }

  public async getCandidates() {
    try {
      this.candidatesTest = await readCandidates();
    } catch (error: unknown) {
      console.error("Error getting candidates:", error);
      this.candidatesTest = [];
    }
    return this.candidatesTest;
  }

  public async eraseVoters() {
    try {
      await clearVoters();
      await this.loadVoters();
      this.processedVotes.clear();
    } catch (error: unknown) {
      console.error("Error erasing voters:", error);
      throw new Error("Failed to erase voters");
    }
  }

  public async eraseResults() {
    try {
      await clearResults();
      this.results = null as any;
      await this.loadResults();
    } catch (error: unknown) {
      console.error("Error erasing results:", error);
      throw new Error("Failed to erase results");
    }
  }

  public revealVoter(voter: Voter) {
    if (!voter?.electoralIV || !voter.electoralId) {
      throw new Error("Invalid voter data");
    }
    try {
      const decryptedId = getCryptoBlockIdentifier().decryptData({
        IV: voter.electoralIV,
        CIPHER_TEXT: voter.electoralId,
      });
      return { electoralId: decryptedId, identifier: voter.identifier };
    } catch (error: unknown) {
      console.error("Error decrypting voter data:", error);
      throw new Error("Failed to decrypt voter data");
    }
  }

  public async existsVoter(voter: Voter): Promise<boolean> {
    if (!voter?.identifier) return false;
    return voter.identifier in this.hashVoters;
  }

  public existsCandidate(code: string): boolean {
    if (!code) return false;
    return code in this.hashCandidates;
  }

  public async processVotes(): Promise<void> {
    if (!this.candidates || !this.voters || !this.announcement) {
      throw new Error("Cannot process votes: missing data");
    }

    this.hashCandidates = {};
    this.hashVoters = {};

    for (const candidate of this.candidates) {
      this.hashCandidates[candidate.code] = candidate;
    }

    const votesProcessed: HashMap<boolean> = {};
    this.electionState = ElectionState.Ended;

    for (const voter of this.voters) {
      this.hashVoters[voter.identifier] = voter;
      votesProcessed[voter.identifier] = false;
    }

    let counter_votes = 0;
    let sum_durations = 0;

    for (const voter of this.voters) {
      if (
        votesProcessed[voter.identifier] ||
        this.processedVotes.has(voter.identifier)
      ) {
        console.log("Voter already voted.");
        continue;
      }
      if (!voter.state) continue;
      if (voter.identifier === "00000" || voter.identifier === "20000")
        continue;

      try {
        await this.placeVote(voter);

        if (this.announcement.startTimeVoting) {
          const startTime = new Date(this.announcement.startTimeVoting);
          const endTime = new Date(voter.voteTime || Date.now());
          if (
            !Number.isNaN(startTime.getTime()) &&
            !Number.isNaN(endTime.getTime())
          ) {
            const duration =
              (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            if (duration >= 0) sum_durations += duration;
          }
        }

        if (voter.state) {
          counter_votes++;
          votesProcessed[voter.identifier] = true;
          this.processedVotes.add(voter.identifier);
        }
      } catch (error: unknown) {
        console.error(
          `Error processing vote for voter ${voter.identifier}:`,
          error,
        );
      }
    }

    const durationPerVote =
      counter_votes > 0 ? sum_durations / counter_votes : 0;
    const winner: Candidate | null = this.winningCandidate();

    const candidate_results: CandidateResult[] = this.candidates
      .map((x) => this.hashCandidates[x.code])
      .filter(Boolean)
      .map((value) => ({
        numVotes: value.num_votes,
        percentage:
          this.announcement.numOfVoters > 0
            ? (value.num_votes * 100) / this.announcement.numOfVoters
            : 0,
        candidate: value,
      }));

    const startTime = new Date(this.announcement.startTimeVoting).getTime();
    const endTime = new Date(this.announcement.endTimeVoting).getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      throw new Error("Invalid election time data");
    }

    let sum = 0;
    this.provinces.forEach((x) => {
      if (
        this.statsPerProvince[x] &&
        typeof this.statsPerProvince[x].sum === "number"
      ) {
        sum += this.statsPerProvince[x].sum;
      }
    });

    const results: Results = {
      startTime,
      endTime,
      winner: winner!,
      expectedTotalVotes: this.announcement.numOfVoters,
      totalVotesReceived: counter_votes,
      totalCandidates: this.announcement.numOfCandidates,
      averageTimePerVote: durationPerVote,
      candidatesResult: candidate_results,
      votesPerProvince: this.statsPerProvince,
      averageVotePerProvince:
        this.provinces.length > 0 ? sum / this.provinces.length : 0,
      votesPerDay: 0,
      votesPerParty: this.statsPerProvince,
    };

    try {
      await writeResults(results);
      await this.loadResults();
      this.results = results;
    } catch (error: unknown) {
      console.error("Error saving results:", error);
      throw new Error("Failed to save election results");
    }
  }

  public async placeVote(voter: Voter) {
    if (!(await this.existsVoter(voter))) {
      console.log("Voter does not exist.");
      return;
    }
    if (!this.isValidElectionTime()) {
      console.log("Invalid voting time.");
      return;
    }
    if (this.processedVotes.has(voter.identifier)) {
      console.log("Vote already processed.");
      return;
    }
    if (!voter.choiceCode || !voter.IV) {
      console.log("Invalid voter choice data.");
      return;
    }

    let choice_code: string;
    try {
      choice_code = getCryptoBlockVote().decryptData({
        CIPHER_TEXT: voter.choiceCode,
        IV: voter.IV,
      });
    } catch (error: unknown) {
      console.error("Error decrypting vote:", error);
      return;
    }

    if (!this.existsCandidate(choice_code)) {
      console.log("Candidate does not exist.");
      return;
    }

    if (this.hashVoters[voter.identifier])
      this.hashVoters[voter.identifier].state = true;
    if (this.hashCandidates[choice_code])
      this.hashCandidates[choice_code].num_votes++;

    try {
      const voterFound = this.revealVoter(voter);
      const citizen = this.citizens.find(
        (x) => x.electoralId === voterFound.electoralId,
      );
      if (!citizen) {
        console.log(
          "Citizen not found for electoral ID:",
          voterFound.electoralId,
        );
        return;
      }

      const province = citizen.province;
      if (
        this.provinces.includes(province) &&
        this.statsPerProvince[province] &&
        this.hashCandidates[choice_code]
      ) {
        const stat = this.statsPerProvince[province];
        const party = this.hashCandidates[choice_code].party;
        if (typeof stat[party] === "number") stat[party]++;
        if (typeof stat.sum === "number") stat.sum++;
        this.statsPerProvince[province] = stat;
      }
    } catch (error: unknown) {
      console.error("Error updating statistics:", error);
    }

    this.processedVotes.add(voter.identifier);
  }

  public winningCandidate(): Candidate | null {
    if (!this.candidates || this.candidates.length === 0) return null;
    const winner = this.candidates.reduce((prev, curr) =>
      prev.num_votes > curr.num_votes ? prev : curr,
    );
    const num_winners = this.candidates.filter(
      (x) => x.num_votes === winner.num_votes,
    ).length;
    if (winner.num_votes === 0 || num_winners >= 2) return null;
    return winner;
  }

  public async getResults(): Promise<Results> {
    try {
      await this.initVariables();
      await this.processVotes();
      return this.results;
    } catch (error: unknown) {
      console.error("Error getting results:", error);
      throw new Error("Failed to get election results");
    }
  }

  public async getResultsComputed(): Promise<Results> {
    try {
      await this.initVariables();
      return this.results;
    } catch (error: unknown) {
      console.error("Error getting computed results:", error);
      throw new Error("Failed to get computed election results");
    }
  }
}

export default SmartContract;
