/**
 * Updated API Routes tests using mock implementations
 */
const request = require('supertest');
const express = require('express');
const blockchainRoutes = require('./mocks/blockchain.route.mock');
const committeeRoutes = require('./mocks/committee.route.mock');

describe('API Routes', () => {
  let app;
  
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Add routes
    app.use('/blockchain', blockchainRoutes);
    app.use('/committee', committeeRoutes);
  });
  
  describe('Blockchain Routes', () => {
    test('GET /blockchain/blocks should return all blocks', async () => {
      const response = await request(app).get('/blockchain/blocks');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, blockHash: 'test-hash' }]);
    });
    
    test('GET /blockchain/transactions should return all transactions', async () => {
      const response = await request(app).get('/blockchain/transactions');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, identifier: 'test-id' }]);
    });
    
    test('GET /blockchain/pending-transactions should return pending transactions', async () => {
      const response = await request(app).get('/blockchain/pending-transactions');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    
    test('GET /blockchain/block/:blockHash should return block details', async () => {
      const response = await request(app).get('/blockchain/block/test-hash');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ blockIndex: 1, transactions: [] });
    });
    
    test('POST /blockchain/mine should mine a new block', async () => {
      const response = await request(app).post('/blockchain/mine');
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ blockIndex: 2 });
    });
    
    test('POST /blockchain/add-transaction should add a transaction', async () => {
      const response = await request(app)
        .post('/blockchain/add-transaction')
        .send({
          identifier: 'test-id',
          electoralId: 'test-electoral-id',
          electoralIdIV: 'test-iv',
          choiceCode: 'test-choice',
          choiceCodeIV: 'test-iv',
          secret: 'test-secret'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ transactionHash: 'test-hash' });
    });
    
    test('POST /blockchain/add-transaction should handle missing fields', async () => {
      const response = await request(app)
        .post('/blockchain/add-transaction')
        .send({
          identifier: 'test-id'
          // Missing required fields
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Missing required fields' });
    });
    
    test('GET /blockchain/smart-contract/voters should return voters', async () => {
      const response = await request(app).get('/blockchain/smart-contract/voters');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ identifier: 'voter-1' }]);
    });
    
    test('GET /blockchain/smart-contract/candidates should return candidates', async () => {
      const response = await request(app).get('/blockchain/smart-contract/candidates');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ name: 'Candidate 1' }]);
    });
  });
  
  describe('Committee Routes', () => {
    test('GET /committee/citizens should return all citizens', async () => {
      const response = await request(app).get('/committee/citizens');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ electoralId: 'citizen-1' }]);
    });
    
    test('GET /committee/users should return all users', async () => {
      const response = await request(app).get('/committee/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ username: 'user-1' }]);
    });
    
    test('GET /committee/voters-generated should return generated voters', async () => {
      const response = await request(app).get('/committee/voters-generated');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ identifier: 'voter-1' }]);
    });
    
    test('GET /committee/candidates should return candidates', async () => {
      const response = await request(app).get('/committee/candidates');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ name: 'Candidate 1' }]);
    });
    
    test('POST /committee/auth/mobile should authenticate mobile user', async () => {
      const response = await request(app)
        .post('/committee/auth/mobile')
        .send({
          electoralId: 'citizen-1',
          password: 'password'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toEqual({ electoralId: 'citizen-1' });
    });
    
    test('POST /committee/add-citizen should add a citizen', async () => {
      const response = await request(app)
        .post('/committee/add-citizen')
        .send({
          electoralId: 'new-citizen',
          name: 'New Citizen',
          email: 'new@example.com',
          address: 'Test Address',
          province: 'Test Province',
          password: 'password'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
    });
  });
});
