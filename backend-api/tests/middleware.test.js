/**
 * Middleware tests for authentication and security
 */
const { verifyJWT } = require('../build/middleware/verifyJWT');
const { verifyJWTWeb } = require('../build/middleware/verifyJWTWeb');
const { credentials } = require('../build/middleware/credentials');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      sendStatus: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });
  
  describe('verifyJWT', () => {
    test('should call next() when valid token is provided', () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { electoralId: 'test-id' });
      });
      
      verifyJWT(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual({ electoralId: 'test-id' });
      expect(next).toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
    
    test('should return 401 when no token is provided', () => {
      verifyJWT(req, res, next);
      
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return 403 when invalid token is provided', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });
      
      verifyJWT(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should handle token without Bearer prefix', () => {
      req.headers.authorization = 'valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { electoralId: 'test-id' });
      });
      
      verifyJWT(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual({ electoralId: 'test-id' });
      expect(next).toHaveBeenCalled();
    });
  });
  
  describe('verifyJWTWeb', () => {
    test('should call next() when valid token is provided', () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { username: 'test-user' });
      });
      
      verifyJWTWeb(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual({ username: 'test-user' });
      expect(next).toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
    
    test('should return 401 when no token is provided', () => {
      verifyJWTWeb(req, res, next);
      
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should return 403 when invalid token is provided', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });
      
      verifyJWTWeb(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('credentials', () => {
    test('should set appropriate headers for allowed origins', () => {
      req.headers.origin = 'http://localhost:3000';
      
      credentials(req, res, next);
      
      expect(res.header).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
    
    test('should handle requests without origin header', () => {
      credentials(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
