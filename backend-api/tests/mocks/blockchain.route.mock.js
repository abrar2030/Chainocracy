/**
 * Mock implementation for blockchain.route.js to fix import/export issues
 */
const express = require('express');
const router = express.Router();

// Mock the blockchain instance instead of creating a new one
const blockchain = {
  getBlocks: jest.fn().mockReturnValue([{ id: 1, blockHash: 'test-hash' }]),
  getTransactions: jest.fn().mockReturnValue([{ id: 1, identifier: 'test-id' }]),
  getPendingTransactions: jest.fn().mockReturnValue([]),
  getBlockDetails: jest.fn().mockReturnValue({ blockIndex: 1, transactions: [] }),
  mineBlock: jest.fn().mockReturnValue({ blockIndex: 2 }),
  addBlock: jest.fn().mockReturnValue(true),
  addPendingTransaction: jest.fn().mockReturnValue({ transactionHash: 'test-hash' }),
  getSmartContractVoters: jest.fn().mockResolvedValue([{ identifier: 'voter-1' }]),
  getSmartContractCandidates: jest.fn().mockResolvedValue([{ name: 'Candidate 1' }]),
  deployVoters: jest.fn().mockResolvedValue([{ identifier: 'voter-1' }]),
  deployCandidatesBlockchain: jest.fn().mockResolvedValue([{ name: 'Candidate 1' }]),
  clearChainsFromStorage: jest.fn().mockResolvedValue([]),
  getCitizenRelatedIdentifier: jest.fn().mockResolvedValue('test-identifier')
};

// Routes for blockchain operations
router.get('/blocks', (req, res) => {
  res.json(blockchain.getBlocks());
});

router.get('/transactions', (req, res) => {
  res.json(blockchain.getTransactions());
});

router.get('/pending-transactions', (req, res) => {
  res.json(blockchain.getPendingTransactions());
});

router.get('/block/:blockHash', (req, res) => {
  const block = blockchain.getBlockDetails(req.params.blockHash);
  
  if (!block) {
    return res.status(404).json({ message: 'Block not found' });
  }
  
  res.json(block);
});

router.post('/mine', (req, res) => {
  const block = blockchain.mineBlock();
  
  if (!block) {
    return res.status(400).json({ message: 'Mining failed' });
  }
  
  res.status(201).json(block);
});

router.post('/add-transaction', (req, res) => {
  const { identifier, electoralId, electoralIdIV, choiceCode, choiceCodeIV, secret } = req.body;
  
  if (!identifier || !electoralId || !electoralIdIV || !choiceCode || !choiceCodeIV || !secret) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const transaction = blockchain.addPendingTransaction(
    identifier, electoralId, electoralIdIV, choiceCode, choiceCodeIV, secret
  );
  
  if (!transaction) {
    return res.status(400).json({ message: 'Invalid transaction' });
  }
  
  res.status(201).json(transaction);
});

router.get('/smart-contract/voters', async (req, res) => {
  const voters = await blockchain.getSmartContractVoters();
  res.json(voters);
});

router.get('/smart-contract/candidates', async (req, res) => {
  const candidates = await blockchain.getSmartContractCandidates();
  res.json(candidates);
});

router.post('/deploy-voters', async (req, res) => {
  const voters = await blockchain.deployVoters();
  res.json(voters);
});

router.post('/deploy-candidates', async (req, res) => {
  const candidates = await blockchain.deployCandidatesBlockchain();
  res.json(candidates);
});

router.delete('/clear-chains', async (req, res) => {
  const result = await blockchain.clearChainsFromStorage();
  res.json(result);
});

router.get('/citizen-identifier/:electoralId', async (req, res) => {
  const identifier = await blockchain.getCitizenRelatedIdentifier(req.params.electoralId);
  
  if (!identifier) {
    return res.status(404).json({ message: 'Identifier not found' });
  }
  
  res.json({ identifier });
});

module.exports = router;
