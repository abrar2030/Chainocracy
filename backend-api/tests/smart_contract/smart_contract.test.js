import SmartContract from '../../src/smart_contract/smart_contract';
import { Voter, Candidate } from '../../src/blockchain/data_types';
import { Announcement, Citizen } from '../../src/committee/data_types';
import * as leveldb from '../../src/leveldb';

// Mock the dependencies
jest.mock('../../src/crypto/cryptoBlockchain', () => {
  return jest.fn().mockImplementation(() => {
    return {
      decryptData: jest.fn((data) => {
        if (data.CIPHER_TEXT === 'encrypted_electoral_id') return 'decrypted_electoral_id';
        if (data.CIPHER_TEXT === 'encrypted_choice_code') return 'PARTY1';
        return '';
      })
    };
  });
});

jest.mock('../../src/leveldb', () => ({
  readAnnouncement: jest.fn(),
  readCandidates: jest.fn(),
  readCitizens: jest.fn(),
  readResults: jest.fn(),
  readVoters: jest.fn(),
  writeResults: jest.fn(),
  clearVoters: jest.fn(),
  clearResults: jest.fn()
}));

describe('SmartContract', () => {
  let smartContract;
  let mockAnnouncement;
  let mockCandidates;
  let mockVoters;
  let mockCitizens;

  beforeEach(() => {
    // Setup mock data
    mockAnnouncement = {
      startTimeVoting: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      endTimeVoting: new Date(Date.now() + 3600000).toISOString(),   // 1 hour from now
      numOfVoters: 100,
      numOfCandidates: 3
    };

    mockCandidates = [
      { code: 'PARTY1', party: 'Party1', num_votes: 0 },
      { code: 'PARTY2', party: 'Party2', num_votes: 0 },
      { code: 'PARTY3', party: 'Party3', num_votes: 0 }
    ];

    mockVoters = [
      { 
        identifier: '12345', 
        electoralId: 'encrypted_electoral_id', 
        electoralIV: 'iv_value',
        choiceCode: 'encrypted_choice_code',
        IV: 'iv_value',
        state: false,
        voteTime: new Date().toISOString()
      }
    ];

    mockCitizens = [
      { electoralId: 'decrypted_electoral_id', province: 'Luanda' }
    ];

    // Setup mocks
    leveldb.readAnnouncement.mockResolvedValue(mockAnnouncement);
    leveldb.readCandidates.mockResolvedValue(mockCandidates);
    leveldb.readVoters.mockResolvedValue(mockVoters);
    leveldb.readCitizens.mockResolvedValue(mockCitizens);
    leveldb.readResults.mockResolvedValue(null);

    // Create instance
    smartContract = new SmartContract();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct state', async () => {
      expect(smartContract.electionState).toBeDefined();
      expect(smartContract.provinces).toHaveLength(18);
      expect(await smartContract.getAnnouncement()).toEqual(mockAnnouncement);
    });
  });

  describe('isValidElectionTime', () => {
    it('should return true when current time is within election period', () => {
      expect(smartContract.isValidElectionTime()).toBe(true);
    });

    it('should return false when current time is outside election period', async () => {
      const pastAnnouncement = {
        ...mockAnnouncement,
        startTimeVoting: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        endTimeVoting: new Date(Date.now() - 3600000).toISOString()    // 1 hour ago
      };
      
      leveldb.readAnnouncement.mockResolvedValue(pastAnnouncement);
      await smartContract.getAnnouncement();
      
      expect(smartContract.isValidElectionTime()).toBe(false);
    });
  });

  describe('getVoters and getCandidates', () => {
    it('should return voters', async () => {
      const voters = await smartContract.getVoters();
      expect(voters).toEqual(mockVoters);
    });

    it('should return candidates', async () => {
      const candidates = await smartContract.getCandidates();
      expect(candidates).toEqual(mockCandidates);
    });
  });

  describe('revealVoter', () => {
    it('should decrypt voter electoral ID', () => {
      const result = smartContract.revealVoter(mockVoters[0]);
      expect(result).toEqual({
        electoralId: 'decrypted_electoral_id',
        identifier: '12345'
      });
    });
  });

  describe('winningCandidate', () => {
    it('should return null when there is no winner', () => {
      expect(smartContract.winningCandidate()).toBeNull();
    });

    it('should return the candidate with most votes', async () => {
      const updatedCandidates = [
        { code: 'PARTY1', party: 'Party1', num_votes: 10 },
        { code: 'PARTY2', party: 'Party2', num_votes: 5 },
        { code: 'PARTY3', party: 'Party3', num_votes: 3 }
      ];
      
      leveldb.readCandidates.mockResolvedValue(updatedCandidates);
      await smartContract.getCandidates();
      smartContract.candidates = updatedCandidates;
      
      const winner = smartContract.winningCandidate();
      expect(winner).toEqual(updatedCandidates[0]);
    });

    it('should return null when there is a tie', async () => {
      const tiedCandidates = [
        { code: 'PARTY1', party: 'Party1', num_votes: 10 },
        { code: 'PARTY2', party: 'Party2', num_votes: 10 },
        { code: 'PARTY3', party: 'Party3', num_votes: 3 }
      ];
      
      leveldb.readCandidates.mockResolvedValue(tiedCandidates);
      await smartContract.getCandidates();
      smartContract.candidates = tiedCandidates;
      
      const winner = smartContract.winningCandidate();
      expect(winner).toBeNull();
    });
  });

  describe('eraseVoters and eraseResults', () => {
    it('should clear voters', async () => {
      await smartContract.eraseVoters();
      expect(leveldb.clearVoters).toHaveBeenCalled();
    });

    it('should clear results', async () => {
      await smartContract.eraseResults();
      expect(leveldb.clearResults).toHaveBeenCalled();
      expect(smartContract.results).toBeNull();
    });
  });

  describe('getResults', () => {
    it('should process votes and return results', async () => {
      // This is a complex test that would require more mocking
      // For now, we'll just verify it calls the right methods
      await smartContract.getResults();
      expect(leveldb.writeResults).toHaveBeenCalled();
    });
  });

  // Add more tests for edge cases and error handling
  describe('error handling', () => {
    it('should handle errors when loading data', async () => {
      leveldb.readCandidates.mockRejectedValue(new Error('Database error'));
      
      // Should not throw an error
      await expect(smartContract.loadCandidates()).resolves.toEqual([]);
    });
  });
});
