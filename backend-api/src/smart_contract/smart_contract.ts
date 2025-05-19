// Enhanced Smart Contract with improved security
import assert from 'assert';
import { Voter, Candidate, Results, CandidateResult, HashMap } from '../blockchain/data_types';
import CryptoBlockchain from '../crypto/cryptoBlockchain';
import { clearResults, clearVoters, readAnnouncement, readCandidates, readCitizens, readResults, readVoters, writeResults } from '../leveldb';
import { Announcement, Citizen } from '../committee/data_types';

// Use environment variables with fallback for better security
const SECRET_KEY_IDENTIFIER = process.env.SECRET_KEY_IDENTIFIER || '';
const SECRET_IV_IDENTIFIER = process.env.SECRET_IV_IDENTIFIER || '';
const SECRET_KEY_VOTES = process.env.SECRET_KEY_VOTES || '';
const SECRET_IV_VOTES = process.env.SECRET_IV_VOTES || '';

// Validate environment variables are set
if (!SECRET_KEY_IDENTIFIER || !SECRET_IV_IDENTIFIER || !SECRET_KEY_VOTES || !SECRET_IV_VOTES) {
  console.error('ERROR: Required environment variables for encryption are not set');
  // In production, you might want to exit the process
  // process.exit(1);
}

const CryptoBlockIdentifier = new CryptoBlockchain(SECRET_KEY_IDENTIFIER, SECRET_IV_IDENTIFIER);
const CryptoBlockVote = new CryptoBlockchain(SECRET_KEY_VOTES, SECRET_IV_VOTES);

enum ElectionState {
    Created = 0,
    Announced,
    Started,
    Happening,
    Ended,
}

class SmartContract {
    private candidates: Candidate[];
    private candidatesTest: Candidate[];

    private voters: Voter[];
    private votersTest: Voter[];

    private citizens: Citizen[];

    private hashCandidates: HashMap<Candidate>;
    private hashVoters: HashMap<Voter>;

    private electionState: ElectionState;
    private announcement: Announcement;

    private provinces: string[];
    private results: Results;

    private statsPerProvince: HashMap<HashMap<number>>;
    
    // Track processed votes to prevent double voting
    private processedVotes: Set<string>;

    constructor() {
        this.electionState = ElectionState.Created;
        this.processedVotes = new Set<string>();
        this.initVariables();
        this.update();
    }

    public update() {
        this.initVariables();
        this.electionState = ElectionState.Started;
    }

    private async initVariables() {
        this.candidates = [];
        this.voters = [];
        this.citizens = [];

        // Angola provinces - moved to a constant for better maintainability
        this.provinces = [
            "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
            "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
            "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
            "Namibe", "Uíge", "Zaire"
        ];     
        
        this.hashCandidates = {};
        this.hashVoters = {};
        
        try {
            await Promise.all([
                this.loadCandidates(),
                this.loadVoters(),
                this.loadAnnouncement(),
                this.loadCitizens(),
                this.loadResults()
            ]);
        } catch (error) {
            console.error('Error initializing variables:', error);
            // Handle initialization errors gracefully
        }

        this.statsPerProvince = {};
        this.provinces.forEach(p => {
            let map: HashMap<number> = {};

            this.candidates.forEach(c => {
                map[c.party] = 0;
            });

            map['sum'] = 0;

            this.statsPerProvince[p] = map;
        });
    }

    private async loadCitizens() {
        try {
            this.citizens = await readCitizens();
            return this.citizens;
        } catch (error) {
            console.error('Error loading citizens:', error);
            this.citizens = [];
            return [];
        }
    }

    private async loadAnnouncement() {
        try {
            this.announcement = await readAnnouncement();
            return this.announcement;
        } catch (error) {
            console.error('Error loading announcement:', error);
            return null;
        }
    }

    private async loadResults() {
        try {
            this.results = await readResults();
            return this.results;
        } catch (error) {
            console.error('Error loading results:', error);
            return null;
        }
    }

    private async loadVoters(): Promise<Voter[]> {
        try {
            this.voters = await readVoters();
            return this.voters;
        } catch (error) {
            console.error('Error loading voters:', error);
            this.voters = [];
            return [];
        }
    }

    private async loadCandidates(): Promise<Candidate[]> {
        try {
            this.candidates = await readCandidates();
            return this.candidates;
        } catch (error) {
            console.error('Error loading candidates:', error);
            this.candidates = [];
            return [];
        }
    }

    public async getAnnouncement() {
        try {
            this.announcement = await readAnnouncement();
        } catch (error) {
            console.error('Error getting announcement:', error);
        }

        return this.announcement;
    }

    public isValidElectionTime(): boolean {
        if (!this.announcement) return false;
        
        const currentTime: number = Date.now();
        const startTime = new Date(this.announcement.startTimeVoting).getTime();
        const endTime = new Date(this.announcement.endTimeVoting).getTime();
        
        // Validate date objects
        if (isNaN(startTime) || isNaN(endTime)) {
            console.error('Invalid date format in announcement');
            return false;
        }
        
        return this.isElectionState() && 
               currentTime >= startTime && 
               currentTime <= endTime;
    }

    private isElectionState(): boolean {
        return this.electionState >= ElectionState.Started && 
               this.electionState <= ElectionState.Ended;
    }

    public async getVoters() {
        try {
            this.votersTest = await readVoters();
        } catch (error) {
            console.error('Error getting voters:', error);
            this.votersTest = [];
        }

        return this.votersTest;
    }

    public async getCandidates() {
        try {
            this.candidatesTest = await readCandidates();
        } catch (error) {
            console.error('Error getting candidates:', error);
            this.candidatesTest = [];
        }

        return this.candidatesTest;
    }

    public async eraseVoters() {
        try {
            await clearVoters();
            await this.loadVoters();
            // Clear processed votes tracking
            this.processedVotes.clear();
        } catch (error) {
            console.error('Error erasing voters:', error);
            throw new Error('Failed to erase voters');
        }
    }

    public async eraseResults() {
        try {
            await clearResults();
            this.results = null;
            await this.loadResults();
        } catch (error) {
            console.error('Error erasing results:', error);
            throw new Error('Failed to erase results');
        }
    }

    public revealVoter(voter: Voter) {
        if (!voter || !voter.electoralIV || !voter.electoralId) {
            throw new Error('Invalid voter data');
        }

        const objData = {
            IV: voter.electoralIV,
            CIPHER_TEXT: voter.electoralId,
        };

        try {
            const decryptedId = CryptoBlockIdentifier.decryptData(objData);
            
            return {
                electoralId: decryptedId,
                identifier: voter.identifier
            };
        } catch (error) {
            console.error('Error decrypting voter data:', error);
            throw new Error('Failed to decrypt voter data');
        }
    }

    private announceElection() {
        this.electionState = ElectionState.Announced;
    }

    private startElection() {
        this.electionState = ElectionState.Started;
    }

    private endElection() {
        this.electionState = ElectionState.Ended;
    }

    private async existsVoter(voter: Voter): Promise<boolean> {
        if (!voter || !voter.identifier) return false;
        return voter.identifier in this.hashVoters;
    }

    private existsCandidate(code: string): boolean {
        if (!code) return false;
        return code in this.hashCandidates;
    }

    private async processVotes(): Promise<void> {
        if (!this.candidates || !this.voters || !this.announcement) {
            console.error('Missing required data for vote processing');
            throw new Error('Cannot process votes: missing data');
        }

        // Reset hash maps
        this.hashCandidates = {};
        this.hashVoters = {};
        
        // Build candidate lookup
        for (const candidate of this.candidates) {
            this.hashCandidates[candidate.code] = candidate;
        }

        // Track processed votes
        let votesProcessed: HashMap<boolean> = {};
        this.electionState = ElectionState.Ended;

        // Build voter lookup
        for (const voter of this.voters) {
            this.hashVoters[voter.identifier] = voter;
            votesProcessed[voter.identifier] = false;
        }

        let counter_votes: number = 0;
        let sum_durations: number = 0;

        // Process each vote with additional validation
        for (const voter of this.voters) {
            // Skip already processed votes
            if (votesProcessed[voter.identifier] || this.processedVotes.has(voter.identifier)) {
                console.log("Voter already voted.");
                continue;
            }

            if (!voter.state) continue;
            
            // Skip test/default transactions
            if (voter.identifier === "00000" || voter.identifier === "20000") continue;

            try {
                await this.placeVote(voter);
                
                // Calculate vote duration
                if (this.announcement.startTimeVoting) {
                    const startTime: Date = new Date(this.announcement.startTimeVoting);
                    const endTime: Date = new Date(voter.voteTime);
                    
                    if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
                        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // In minutes
                        if (duration >= 0) { // Ensure positive duration
                            sum_durations += duration;
                        }
                    }
                }

                if (voter.state) {
                    counter_votes++;
                    votesProcessed[voter.identifier] = true;
                    this.processedVotes.add(voter.identifier); // Track processed vote
                }
            } catch (error) {
                console.error(`Error processing vote for voter ${voter.identifier}:`, error);
                // Continue processing other votes
            }
        }

        // Calculate statistics
        const durationPerVote = counter_votes > 0 ? sum_durations / counter_votes : 0;
        const winner: Candidate = this.winningCandidate();

        // Prepare candidate results
        let candidate_results: CandidateResult[] = [];
        for (const x of this.candidates) {
            const value = this.hashCandidates[x.code];
            if (!value) continue;

            let candidateResult: CandidateResult = {
                numVotes: value.num_votes,
                percentage: this.announcement.numOfVoters > 0 ? 
                    (value.num_votes * 100) / this.announcement.numOfVoters : 0,
                candidate: value
            };

            candidate_results.push(candidateResult);
        }

        // Validate timestamps
        const startTime: number = new Date(this.announcement.startTimeVoting).getTime();
        const endTime: number = new Date(this.announcement.endTimeVoting).getTime();
        
        if (isNaN(startTime) || isNaN(endTime)) {
            throw new Error('Invalid election time data');
        }

        // Calculate province statistics
        let sum: number = 0;
        this.provinces.forEach(x => {
            if (this.statsPerProvince[x] && typeof this.statsPerProvince[x]['sum'] === 'number') {
                sum += this.statsPerProvince[x]['sum'];
            }
        });

        const averageVotePerProvince = this.provinces.length > 0 ? sum / this.provinces.length : 0;

        // Create results object
        let results: Results = {
            startTime: startTime,
            endTime: endTime,
            winner: winner,
            expectedTotalVotes: this.announcement.numOfVoters,
            totalVotesReceived: counter_votes,
            totalCandidates: this.announcement.numOfCandidates,
            averageTimePerVote: durationPerVote,
            candidatesResult: candidate_results,
            votesPerProvince: this.statsPerProvince,
            averageVotePerProvince: averageVotePerProvince,
            votesPerDay: 0,
            votesPerParty: this.statsPerProvince,
        };

        try {
            await writeResults(results);
            await this.loadResults();
            this.results = results;
        } catch (error) {
            console.error('Error saving results:', error);
            throw new Error('Failed to save election results');
        }
    }

    private async placeVote(voter: Voter) {
        // Validate voter exists
        if (!(await this.existsVoter(voter))) {
            console.log("Voter does not exist.");
            return;
        }

        // Validate election time
        if (!this.isValidElectionTime()) {
            console.log("Invalid voting time.");
            return;
        }

        // Prevent double voting
        if (this.processedVotes.has(voter.identifier)) {
            console.log("Vote already processed.");
            return;
        }

        // Validate voter data
        if (!voter.choiceCode || !voter.IV) {
            console.log("Invalid voter choice data.");
            return;
        }

        // Decrypt vote
        const objData = {
            CIPHER_TEXT: voter.choiceCode,
            IV: voter.IV,
        };

        let choice_code: string;
        try {
            choice_code = CryptoBlockVote.decryptData(objData);
        } catch (error) {
            console.error('Error decrypting vote:', error);
            return;
        }

        // Validate candidate exists
        if (!this.existsCandidate(choice_code)) {
            console.log("Candidate does not exist.");
            return;
        }

        // Record vote
        if (this.hashVoters[voter.identifier]) {
            this.hashVoters[voter.identifier].state = true;
        }
        
        if (this.hashCandidates[choice_code]) {
            this.hashCandidates[choice_code].num_votes++;
        }

        // Update statistics
        try {
            const voterFound = this.revealVoter(voter);
            const electoralId: string = voterFound.electoralId;

            const citizen: Citizen = this.citizens.find(x => x.electoralId === electoralId);
            if (!citizen) {
                console.log("Citizen not found for electoral ID:", electoralId);
                return;
            }

            const province: string = citizen.province;

            if (this.provinces.includes(province) && 
                this.statsPerProvince[province] && 
                this.hashCandidates[choice_code]) {
                
                let currentStatOfProvince = this.statsPerProvince[province];
                const party = this.hashCandidates[choice_code].party;
                
                if (typeof currentStatOfProvince[party] === 'number') {
                    currentStatOfProvince[party]++;
                }
                
                if (typeof currentStatOfProvince['sum'] === 'number') {
                    currentStatOfProvince['sum']++;
                }
                
                this.statsPerProvince[province] = currentStatOfProvince;
            }
        } catch (error) {
            console.error('Error updating statistics:', error);
            // Continue with vote processing even if statistics update fails
        }
        
        // Mark vote as processed
        this.processedVotes.add(voter.identifier);
    }

    public winningCandidate() {
        if (!this.candidates || this.candidates.length === 0) return null;

        // Find candidate with most votes
        let winnerCandidate: Candidate = this.candidates.reduce(
            (prev, curr) => (prev.num_votes > curr.num_votes) ? prev : curr
        );

        // Check for ties or zero votes
        let num_winners = this.candidates.filter(x => x.num_votes === winnerCandidate.num_votes).length;
        if (winnerCandidate.num_votes === 0 || num_winners >= 2) return null;

        return winnerCandidate;
    }

    private candidateResults() {
        return this.results?.candidatesResult || [];
    }

    private timestampToDate(timestamp: number): Date {
        if (isNaN(timestamp)) {
            throw new Error('Invalid timestamp');
        }
        return new Date(timestamp * 1000);
    }

    public async getResults(): Promise<Results> {
        try {
            await this.initVariables();
            await this.processVotes();
            return this.results;
        } catch (error) {
            console.error('Error getting results:', error);
            throw new Error('Failed to get election results');
        }
    }

    public async getResultsComputed(): Promise<Results> {
        try {
            await this.initVariables();
            return this.results;
        } catch (error) {
            console.error('Error getting computed results:', error);
            throw new Error('Failed to get computed election results');
        }
    }
}

export default SmartContract;
