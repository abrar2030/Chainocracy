/**
 * Comprehensive test suite for the committee module
 */
const Committee = require('../build/committee/committee').default;
const { Role } = require('../build/committee/data_types');
const leveldb = require('../build/leveldb');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Mock dependencies
jest.mock('../build/leveldb', () => ({
  readCitizens: jest.fn().mockResolvedValue([]),
  readUsers: jest.fn().mockResolvedValue([]),
  clearVotersGenerated: jest.fn().mockResolvedValue(),
  writeVoterGenerated: jest.fn(),
  clearCandidatesTemp: jest.fn().mockResolvedValue(),
  clearCandidates: jest.fn().mockResolvedValue(),
  writeCandidateTemp: jest.fn(),
  readCandidatesTemp: jest.fn().mockResolvedValue([]),
  readCitizen: jest.fn(),
  readUser: jest.fn(),
  clearCitizens: jest.fn().mockResolvedValue(),
  clearUsers: jest.fn().mockResolvedValue(),
  removeUser: jest.fn().mockResolvedValue(),
  removeCitizen: jest.fn().mockResolvedValue(),
  writeCitizen: jest.fn().mockResolvedValue(),
  writeUser: jest.fn().mockResolvedValue(),
  writeAnnouncement: jest.fn().mockResolvedValue(),
  readAnnouncement: jest.fn().mockResolvedValue({}),
  readVoterGenerated: jest.fn().mockResolvedValue([])
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('speakeasy', () => ({
  generateSecret: jest.fn().mockReturnValue({
    ascii: 'test-ascii',
    hex: 'test-hex',
    base32: 'test-base32',
    otpauth_url: 'test-otpauth-url'
  }),
  totp: {
    verify: jest.fn().mockReturnValue(true)
  }
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn((url, callback) => callback(null, 'data:image/png;base64,test-qr-code'))
}));

describe('Committee', () => {
  let committee;
  
  beforeEach(() => {
    jest.clearAllMocks();
    committee = new Committee();
  });
  
  describe('Constructor and Initialization', () => {
    test('should initialize with empty arrays', () => {
      expect(committee.citizens).toEqual([]);
      expect(committee.candidates).toEqual([]);
      expect(committee.votersGenerated).toEqual([]);
      expect(committee.users).toEqual([]);
    });
    
    test('should load citizens and users on initialization', () => {
      expect(leveldb.readCitizens).toHaveBeenCalled();
      expect(leveldb.readUsers).toHaveBeenCalled();
    });
    
    test('should handle errors during citizens loading', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.readCitizens.mockRejectedValueOnce(new Error('Citizens loading error'));
      
      const newCommittee = new Committee();
      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading citizens:',
        expect.objectContaining({ message: 'Citizens loading error' })
      );
      expect(newCommittee.citizens).toEqual([]);
      
      consoleSpy.mockRestore();
    });
    
    test('should handle errors during users loading', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.readUsers.mockRejectedValueOnce(new Error('Users loading error'));
      
      const newCommittee = new Committee();
      // Wait for promises to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading users:',
        expect.objectContaining({ message: 'Users loading error' })
      );
      expect(newCommittee.users).toEqual([]);
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Identifier Generation', () => {
    test('should generate identifiers for verified citizens', async () => {
      // Mock citizens with verified status
      leveldb.readCitizens.mockResolvedValueOnce([
        { electoralId: 'id1', status: 'verified' },
        { electoralId: 'id2', status: 'verified' },
        { electoralId: 'id3', status: 'pending' } // Should be skipped
      ]);
      
      // Reload citizens
      await committee.loadCitizens();
      
      const voters = await committee.generateIdentifiers();
      
      expect(leveldb.clearVotersGenerated).toHaveBeenCalled();
      expect(leveldb.writeVoterGenerated).toHaveBeenCalledTimes(2); // Only for verified citizens
      expect(voters.length).toBe(2);
      expect(committee.votersGenerated).toEqual(voters);
    });
    
    test('should handle errors during identifier generation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.clearVotersGenerated.mockRejectedValueOnce(new Error('Generation error'));
      
      const voters = await committee.generateIdentifiers();
      
      expect(voters).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error generating identifiers:',
        expect.objectContaining({ message: 'Generation error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Candidate Management', () => {
    test('should clear candidates', async () => {
      const result = await committee.clearCandidates();
      
      expect(leveldb.clearCandidatesTemp).toHaveBeenCalled();
      expect(leveldb.clearCandidates).toHaveBeenCalled();
      expect(committee.candidates).toEqual([]);
      expect(result).toEqual([]);
    });
    
    test('should add candidate to committee', async () => {
      const mockCandidates = [{ name: 'Candidate 1', code: 123 }];
      leveldb.readCandidatesTemp.mockResolvedValueOnce(mockCandidates);
      
      const result = await committee.addCandidateCommittee(
        'Candidate 1', 123, 'Party A', 'PA', 'active'
      );
      
      expect(leveldb.writeCandidateTemp).toHaveBeenCalledWith(123, {
        name: 'Candidate 1',
        num_votes: 0,
        code: 123,
        acronym: 'PA',
        party: 'Party A',
        status: 'active'
      });
      expect(leveldb.readCandidatesTemp).toHaveBeenCalled();
      expect(committee.candidates).toEqual(mockCandidates);
      expect(result).toEqual(mockCandidates);
    });
    
    test('should handle errors during candidate addition', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.writeCandidateTemp.mockRejectedValueOnce(new Error('Candidate error'));
      
      const result = await committee.addCandidateCommittee(
        'Candidate 1', 123, 'Party A', 'PA', 'active'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error adding candidate:',
        expect.objectContaining({ message: 'Candidate error' })
      );
      expect(result).toEqual([]);
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Authentication', () => {
    test('should authenticate mobile user with valid credentials', async () => {
      const mockCitizen = {
        electoralId: 'test-id',
        address: 'Test Address',
        email: 'test@example.com',
        province: 'Test Province',
        password: 'hashed-password'
      };
      
      leveldb.readCitizen.mockResolvedValueOnce(mockCitizen);
      
      const result = await committee.authMobile('test-id', 'password');
      
      expect(leveldb.readCitizen).toHaveBeenCalledWith('test-id');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toEqual({
        electoralId: 'test-id',
        address: 'Test Address',
        email: 'test@example.com',
        province: 'Test Province'
      });
    });
    
    test('should not authenticate mobile user with invalid credentials', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);
      leveldb.readCitizen.mockResolvedValueOnce({
        password: 'hashed-password'
      });
      
      const result = await committee.authMobile('test-id', 'wrong-password');
      
      expect(result).toBeNull();
    });
    
    test('should handle errors during mobile authentication', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.readCitizen.mockRejectedValueOnce(new Error('Auth error'));
      
      const result = await committee.authMobile('test-id', 'password');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Authentication error:',
        expect.objectContaining({ message: 'Auth error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should authenticate web user with valid credentials', async () => {
      const mockUser = {
        username: 'test-user',
        name: 'Test User',
        role: Role.ADMIN,
        password: 'hashed-password'
      };
      
      leveldb.readUser.mockResolvedValueOnce(mockUser);
      
      const result = await committee.authWeb('test-user', 'password');
      
      expect(leveldb.readUser).toHaveBeenCalledWith('test-user');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toEqual({
        username: 'test-user',
        name: 'Test User',
        role: Role.ADMIN
      });
    });
  });
  
  describe('User and Citizen Management', () => {
    test('should erase all citizens', async () => {
      await committee.eraseCitzens();
      
      expect(leveldb.clearCitizens).toHaveBeenCalled();
      expect(leveldb.readCitizens).toHaveBeenCalled();
    });
    
    test('should erase all users', async () => {
      await committee.eraseUsers();
      
      expect(leveldb.clearUsers).toHaveBeenCalled();
      expect(leveldb.readUsers).toHaveBeenCalled();
    });
    
    test('should erase specific user', async () => {
      await committee.eraseUser('test-user');
      
      expect(leveldb.removeUser).toHaveBeenCalledWith('test-user');
      expect(leveldb.readUsers).toHaveBeenCalled();
    });
    
    test('should erase specific citizen', async () => {
      await committee.eraseRegister('test-id');
      
      expect(leveldb.removeCitizen).toHaveBeenCalledWith('test-id');
      expect(leveldb.readCitizens).toHaveBeenCalled();
    });
    
    test('should save citizen', async () => {
      const citizen = { electoralId: 'test-id' };
      await committee.saveCitizen(citizen);
      
      expect(leveldb.writeCitizen).toHaveBeenCalledWith('test-id', citizen);
    });
    
    test('should save user', async () => {
      const user = { username: 'test-user' };
      await committee.saveUser(user);
      
      expect(leveldb.writeUser).toHaveBeenCalledWith('test-user', user);
    });
    
    test('should update citizen token', async () => {
      // Setup mock citizen
      committee.citizens = [{ electoralId: 'test-id', refreshToken: '' }];
      
      await committee.updateTokenCitzen('test-id', 'new-token');
      
      expect(committee.citizens[0].refreshToken).toBe('new-token');
      expect(leveldb.writeCitizen).toHaveBeenCalledWith('test-id', {
        electoralId: 'test-id',
        refreshToken: 'new-token'
      });
    });
    
    test('should handle non-existent citizen for token update', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      committee.citizens = [];
      
      await committee.updateTokenCitzen('non-existent', 'new-token');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Citizen not found for token update:',
        'non-existent'
      );
      expect(leveldb.writeCitizen).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('OTP and QR Code Generation', () => {
    test('should generate OTP', () => {
      const otp = committee.generateOtp();
      
      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: "Election Chainocracy",
        length: 6,
        step: 300
      });
      
      expect(otp).toEqual({
        ascii: 'test-ascii',
        hex: 'test-hex',
        base32: 'test-base32',
        otpauth_url: 'test-otpauth-url'
      });
    });
    
    test('should verify OTP', () => {
      const result = committee.verifyOtp('test-secret', '123456');
      
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'test-secret',
        encoding: 'base32',
        token: '123456'
      });
      
      expect(result).toBe(true);
    });
    
    test('should handle errors during OTP verification', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      speakeasy.totp.verify.mockImplementationOnce(() => {
        throw new Error('OTP verification error');
      });
      
      const result = committee.verifyOtp('test-secret', '123456');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error verifying OTP:',
        expect.objectContaining({ message: 'OTP verification error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should generate QR code', async () => {
      const qrCode = await committee.generateQRCode('test-otpauth-url');
      
      expect(qrcode.toDataURL).toHaveBeenCalledWith(
        'test-otpauth-url',
        expect.any(Function)
      );
      
      expect(qrCode).toBe('data:image/png;base64,test-qr-code');
    });
    
    test('should handle errors during QR code generation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      qrcode.toDataURL.mockImplementationOnce((url, callback) => 
        callback(new Error('QR code error'), null)
      );
      
      const qrCode = await committee.generateQRCode('test-otpauth-url');
      
      expect(qrCode).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to generate QR code:',
        expect.objectContaining({ message: 'QR code error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Announcement Management', () => {
    test('should deploy announcement', async () => {
      const announcementData = {
        startTimeVoting: '2023-01-01',
        endTimeVoting: '2023-01-02',
        dateResults: '2023-01-03',
        numOfCandidates: '5',
        numOfVoters: '100'
      };
      
      const result = await committee.deployAnnouncement(announcementData);
      
      expect(leveldb.writeAnnouncement).toHaveBeenCalledWith(expect.objectContaining({
        startTimeVoting: '2023-01-01',
        endTimeVoting: '2023-01-02',
        dateResults: '2023-01-03',
        numOfCandidates: 5,
        numOfVoters: 100,
        dateCreated: expect.any(Number)
      }));
      
      expect(result).toEqual(committee.announcement);
    });
    
    test('should handle errors during announcement deployment', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      leveldb.writeAnnouncement.mockRejectedValueOnce(new Error('Announcement error'));
      
      const result = await committee.deployAnnouncement({});
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deploying announcement:',
        expect.objectContaining({ message: 'Announcement error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should get announcement', async () => {
      const mockAnnouncement = { startTimeVoting: '2023-01-01' };
      leveldb.readAnnouncement.mockResolvedValueOnce(mockAnnouncement);
      
      const result = await committee.getAnnouncement();
      
      expect(leveldb.readAnnouncement).toHaveBeenCalled();
      expect(result).toEqual(mockAnnouncement);
      expect(committee.announcement).toEqual(mockAnnouncement);
    });
  });
  
  describe('Citizen and User Addition', () => {
    test('should add new citizen', async () => {
      const citizenData = {
        electoralId: 'new-id',
        name: 'New Citizen',
        email: 'new@example.com',
        address: 'New Address',
        province: 'New Province',
        password: 'password'
      };
      
      const result = await committee.addCitzen(citizenData);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(leveldb.writeCitizen).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(committee.citizens.length).toBe(1);
      expect(committee.citizens[0]).toEqual(expect.objectContaining({
        electoralId: 'new-id',
        name: 'New Citizen',
        email: 'new@example.com',
        status: 'pending'
      }));
    });
    
    test('should not add citizen with existing email', async () => {
      committee.citizens = [{ email: 'existing@example.com' }];
      
      const citizenData = {
        electoralId: 'new-id',
        email: 'existing@example.com',
        password: 'password'
      };
      
      const result = await committee.addCitzen(citizenData);
      
      expect(result).toBe(false);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(leveldb.writeCitizen).not.toHaveBeenCalled();
    });
    
    test('should add new user', async () => {
      const userData = {
        username: 'new-user',
        name: 'New User',
        password: 'password',
        role: 'admin'
      };
      
      const result = await committee.addUser(userData);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(leveldb.writeUser).toHaveBeenCalled();
      expect(committee.users.length).toBe(1);
      expect(committee.users[0]).toEqual(expect.objectContaining({
        username: 'new-user',
        name: 'New User',
        role: Role.ADMIN
      }));
      expect(result).toEqual(committee.users);
    });
  });
});
