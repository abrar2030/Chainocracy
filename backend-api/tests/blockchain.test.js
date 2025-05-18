/**
 * Comprehensive test suite for the blockchain module
 */
const BlockChain = require('../build/blockchain/blockchain').default;
const SmartContract = require('../build/smart_contract/smart_contract').default;
const leveldb = require('../build/leveldb');

// Mock dependencies
jest.mock('../build/smart_contract/smart_contract', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      update: jest.fn(),
      isValidElectionTime: jest.fn().mockReturnValue(true),
      getVoters: jest.fn().mockResolvedValue([]),
      getCandidates: jest.fn().mockResolvedValue([])
    }))
  };
});

jest.mock('../build/leveldb', () => ({
  readChain: jest.fn().mockResolvedValue([]),
  writeChain: jest.fn(),
  clearChains: jest.fn().mockResolvedValue([]),
  updateVoter: jest.fn(),
  deployVotersGenerated: jest.fn().mockResolvedValue([]),
  deployCandidates: jest.fn().mockResolvedValue([]),
  readVoterCitizenRelation: jest.fn().mockResolvedValue('test-identifier')
}));

describe('BlockChain', () => {
  let blockchain;
  
  beforeEach(() => {
    jest.clearAllMocks();
    blockchain = new BlockChain();
  });
  
  describe('Constructor and Initialization', () => {
    test('should initialize with genesis block', () => {
      expect(blockchain.chain).toHaveLength(1);
      expect(blockchain.chain[0].blockIndex).toBe(0);
      expect(blockchain.transactionPool).toEqual([]);
    });
    
    test('should initialize smart contract', () => {
      expect(SmartContract).toHaveBeenCalled();
    });
    
    test('should handle errors during smart contract initialization', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      SmartContract.mockImplementationOnce(() => {
        throw new Error('Smart contract initialization error');
      });
      
      const newBlockchain = new BlockChain();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing smart contract:',
        expect.objectContaining({ message: 'Smart contract initialization error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Chain Management', () => {
    test('should set node address and load chain', async () => {
      await blockchain.setNodeAddress('test-node');
      expect(blockchain.nodeAddress).toBe('test-node');
      expect(leveldb.readChain).toHaveBeenCalled();
    });
    
    test('should handle errors during chain loading', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.readChain.mockRejectedValueOnce(new Error('Chain loading error'));
      
      await blockchain.loadChain();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading chain:',
        expect.objectContaining({ message: 'Chain loading error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should clear chains from storage', async () => {
      await blockchain.clearChainsFromStorage();
      expect(leveldb.clearChains).toHaveBeenCalled();
    });
    
    test('should save chain to storage', () => {
      blockchain.saveChain();
      expect(leveldb.writeChain).toHaveBeenCalledWith(blockchain.chain);
    });
    
    test('should handle errors during chain saving', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.writeChain.mockImplementationOnce(() => {
        throw new Error('Chain saving error');
      });
      
      blockchain.saveChain();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving chain:',
        expect.objectContaining({ message: 'Chain saving error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Block Operations', () => {
    test('should get genesis block', () => {
      const genesisBlock = blockchain.getGenesisBlock();
      expect(genesisBlock.blockIndex).toBe(0);
      expect(genesisBlock.blockHeader.previousBlockHash).toBe('-');
    });
    
    test('should get chain', () => {
      const chain = blockchain.getChain();
      expect(chain).toEqual(blockchain.chain);
    });
    
    test('should get chain length', () => {
      expect(blockchain.getLengthChain()).toBe(1);
    });
    
    test('should replace chain if valid', () => {
      // Mock isValidChain to return true
      jest.spyOn(blockchain, 'isValidChain').mockReturnValueOnce(true);
      
      const newChain = [{ blockIndex: 0 }, { blockIndex: 1 }];
      const result = blockchain.replaceChain(newChain);
      
      expect(result).toBe(true);
      expect(blockchain.chain).toEqual(newChain);
    });
    
    test('should not replace chain if invalid', () => {
      // Mock isValidChain to return false
      jest.spyOn(blockchain, 'isValidChain').mockReturnValueOnce(false);
      
      const originalChain = [...blockchain.chain];
      const newChain = [{ blockIndex: 0 }, { blockIndex: 1 }];
      const result = blockchain.replaceChain(newChain);
      
      expect(result).toBe(false);
      expect(blockchain.chain).toEqual(originalChain);
    });
    
    test('should add valid block to chain', () => {
      // Mock isValidBlock to return true
      jest.spyOn(blockchain, 'isValidBlock').mockReturnValueOnce(true);
      
      const block = {
        blockIndex: 1,
        blockHeader: { blockHash: 'test-hash' },
        transactions: [{ data: { identifier: 'test-id' } }]
      };
      
      const result = blockchain.addBlock(block);
      
      expect(result).toBe(true);
      expect(blockchain.chain).toHaveLength(2);
      expect(blockchain.chain[1]).toEqual(block);
      expect(blockchain.transactionPool).toEqual([]);
      expect(blockchain.smartContract.update).toHaveBeenCalled();
      expect(leveldb.updateVoter).toHaveBeenCalledWith('test-id', { identifier: 'test-id' });
    });
    
    test('should not add invalid block to chain', () => {
      // Mock isValidBlock to return false
      jest.spyOn(blockchain, 'isValidBlock').mockReturnValueOnce(false);
      
      const block = { blockIndex: 1 };
      const originalChain = [...blockchain.chain];
      
      const result = blockchain.addBlock(block);
      
      expect(result).toBe(false);
      expect(blockchain.chain).toEqual(originalChain);
    });
    
    test('should handle errors during block addition', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(blockchain, 'isValidBlock').mockImplementationOnce(() => {
        throw new Error('Block validation error');
      });
      
      const block = { blockIndex: 1 };
      const result = blockchain.addBlock(block);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error adding block:',
        expect.objectContaining({ message: 'Block validation error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Transaction Operations', () => {
    test('should add valid pending transaction to pool', () => {
      // Mock isValidTransaction to return true
      jest.spyOn(blockchain, 'isValidTransaction').mockReturnValueOnce(true);
      
      const transaction = blockchain.addPendingTransaction(
        'test-id', 'electoral-id', 'iv', 'choice', 'choice-iv', 'secret'
      );
      
      expect(transaction).toBeDefined();
      expect(blockchain.transactionPool).toHaveLength(1);
      expect(blockchain.transactionPool[0]).toEqual(transaction);
    });
    
    test('should not add invalid pending transaction to pool', () => {
      // Mock isValidTransaction to return false
      jest.spyOn(blockchain, 'isValidTransaction').mockReturnValueOnce(false);
      
      const transaction = blockchain.addPendingTransaction(
        'test-id', 'electoral-id', 'iv', 'choice', 'choice-iv', 'secret'
      );
      
      expect(transaction).toBeNull();
      expect(blockchain.transactionPool).toHaveLength(0);
    });
    
    test('should not add transaction if election time is invalid', () => {
      // Mock isValidElectionTime to return false
      blockchain.smartContract.isValidElectionTime.mockReturnValueOnce(false);
      
      const transaction = blockchain.addPendingTransaction(
        'test-id', 'electoral-id', 'iv', 'choice', 'choice-iv', 'secret'
      );
      
      expect(transaction).toBeNull();
      expect(blockchain.transactionPool).toHaveLength(0);
    });
  });
  
  describe('Validation Methods', () => {
    test('should validate SHA256 hash', () => {
      const validHash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const invalidHash = 'not-a-valid-hash';
      
      expect(blockchain.isSHA256(validHash)).toBe(true);
      expect(blockchain.isSHA256(invalidHash)).toBe(false);
    });
    
    test('should validate vote', () => {
      const validVote = {
        identifier: 'valid-id-123456',
        choiceCode: 'choice',
        secret: 'secret'
      };
      
      const invalidVote1 = {
        identifier: 'id', // Too short
        choiceCode: 'choice',
        secret: 'secret'
      };
      
      const invalidVote2 = {
        identifier: 'valid-id',
        choiceCode: '', // Empty choice
        secret: 'secret'
      };
      
      const invalidVote3 = {
        identifier: 'valid-id',
        choiceCode: 'choice',
        secret: '' // Empty secret
      };
      
      expect(blockchain.isValidVote(validVote)).toBe(true);
      expect(blockchain.isValidVote(invalidVote1)).toBe(false);
      expect(blockchain.isValidVote(invalidVote2)).toBe(false);
      expect(blockchain.isValidVote(invalidVote3)).toBe(false);
    });
  });
  
  describe('Smart Contract Integration', () => {
    test('should get voters from smart contract', async () => {
      const voters = await blockchain.getSmartContractVoters();
      expect(blockchain.smartContract.getVoters).toHaveBeenCalled();
      expect(voters).toEqual([]);
    });
    
    test('should handle errors when getting voters', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      blockchain.smartContract.getVoters.mockRejectedValueOnce(new Error('Voters error'));
      
      const voters = await blockchain.getSmartContractVoters();
      
      expect(voters).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting smart contract voters:',
        expect.objectContaining({ message: 'Voters error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should get candidates from smart contract', async () => {
      const candidates = await blockchain.getSmartContractCandidates();
      expect(blockchain.smartContract.getCandidates).toHaveBeenCalled();
      expect(candidates).toEqual([]);
    });
    
    test('should deploy voters to blockchain', async () => {
      const result = await blockchain.deployVoters();
      expect(leveldb.deployVotersGenerated).toHaveBeenCalled();
      expect(SmartContract).toHaveBeenCalledTimes(2); // Once in constructor, once in deployVoters
      expect(result).toEqual([]);
    });
    
    test('should deploy candidates to blockchain', async () => {
      const result = await blockchain.deployCandidatesBlockchain();
      expect(leveldb.deployCandidates).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  
  describe('Citizen Identifier Relation', () => {
    test('should get citizen-related identifier', async () => {
      const identifier = await blockchain.getCitizenRelatedIdentifier('test-electoral-id');
      expect(leveldb.readVoterCitizenRelation).toHaveBeenCalledWith('test-electoral-id');
      expect(identifier).toBe('test-identifier');
    });
    
    test('should handle errors when getting citizen identifier', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.readVoterCitizenRelation.mockRejectedValueOnce(new Error('Relation error'));
      
      const identifier = await blockchain.getCitizenRelatedIdentifier('test-electoral-id');
      
      expect(identifier).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting citizen identifier:',
        expect.objectContaining({ message: 'Relation error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
});
