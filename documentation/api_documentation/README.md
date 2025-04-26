# API Documentation

This document provides detailed information about the Chainocracy backend API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://[server-address]:[port]/api
```

For example, if running locally on the default port:

```
http://localhost:3010/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

### Authentication Headers

Include the JWT token in the Authorization header:

```
Authorization: Bearer [your-jwt-token]
```

### Obtaining a Token

To obtain a JWT token, use the login endpoints:

- Committee login: `/committee/login`
- Voter login: `/voters/login`

## API Endpoints

### Blockchain Endpoints

#### GET `/blockchain`

Returns the entire blockchain data structure.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
{
  "chain": [
    {
      "index": 0,
      "timestamp": 1650000000000,
      "transactions": [],
      "previousHash": "0",
      "hash": "0000a8c7d5f6e3b2a1c0d9e8f7b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f",
      "nonce": 0
    },
    // Additional blocks...
  ],
  "pendingTransactions": [],
  "difficulty": 4,
  "miningReward": 100
}
```

#### GET `/blockchain/pending-transactions`

Returns all pending transactions that haven't been included in a block yet.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
[
  {
    "fromAddress": "voter-123",
    "toAddress": "candidate-456",
    "amount": 1,
    "timestamp": 1650000123456,
    "signature": "3045022100a1b2c3d4e5f6...",
    "transactionId": "tx-789"
  },
  // Additional pending transactions...
]
```

#### GET `/blockchain/transactions`

Returns all transactions from all blocks.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
[
  {
    "fromAddress": "voter-123",
    "toAddress": "candidate-456",
    "amount": 1,
    "timestamp": 1650000123456,
    "signature": "3045022100a1b2c3d4e5f6...",
    "transactionId": "tx-789",
    "blockIndex": 2
  },
  // Additional transactions...
]
```

#### GET `/blockchain/blocks`

Returns all blocks in the blockchain.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
[
  {
    "index": 0,
    "timestamp": 1650000000000,
    "transactions": [],
    "previousHash": "0",
    "hash": "0000a8c7d5f6e3b2a1c0d9e8f7b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f",
    "nonce": 0
  },
  // Additional blocks...
]
```

#### GET `/blockchain/block/:index`

Returns a specific block by its index.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `index`: The index of the block to retrieve

**Response Example**:
```json
{
  "index": 2,
  "timestamp": 1650000234567,
  "transactions": [
    {
      "fromAddress": "voter-123",
      "toAddress": "candidate-456",
      "amount": 1,
      "timestamp": 1650000123456,
      "signature": "3045022100a1b2c3d4e5f6...",
      "transactionId": "tx-789"
    }
  ],
  "previousHash": "0000b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2",
  "hash": "0000c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0",
  "nonce": 12345
}
```

#### POST `/blockchain/transaction`

Creates a new transaction (vote).

**Authentication Required**: Yes (Voter)

**Request Body**:
```json
{
  "fromAddress": "voter-123",
  "toAddress": "candidate-456",
  "amount": 1,
  "electionId": "election-789"
}
```

**Response Example**:
```json
{
  "message": "Transaction added successfully",
  "transaction": {
    "fromAddress": "voter-123",
    "toAddress": "candidate-456",
    "amount": 1,
    "timestamp": 1650000345678,
    "signature": "3045022100a1b2c3d4e5f6...",
    "transactionId": "tx-790"
  }
}
```

#### POST `/blockchain/mine`

Mines a new block with pending transactions.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
{
  "message": "Block mined successfully",
  "block": {
    "index": 3,
    "timestamp": 1650000456789,
    "transactions": [
      // Transactions included in the block
    ],
    "previousHash": "0000c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0",
    "hash": "0000d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9",
    "nonce": 67890
  }
}
```

### Committee Endpoints

#### POST `/committee/register`

Registers a new committee member.

**Authentication Required**: Yes (Admin Committee)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "member"
}
```

**Response Example**:
```json
{
  "message": "Committee member registered successfully",
  "committeeId": "committee-123"
}
```

#### POST `/committee/login`

Authenticates a committee member and returns a JWT token.

**Authentication Required**: No

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response Example**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "committeeMember": {
    "id": "committee-123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "member"
  }
}
```

#### GET `/committee/profile`

Returns the profile of the authenticated committee member.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
{
  "id": "committee-123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "member",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Election Endpoints

#### POST `/elections`

Creates a new election.

**Authentication Required**: Yes (Committee)

**Request Body**:
```json
{
  "title": "Presidential Election 2024",
  "description": "National presidential election",
  "startDate": "2024-11-03T00:00:00.000Z",
  "endDate": "2024-11-03T23:59:59.000Z",
  "resultVisibility": "immediate",
  "voterAnonymityLevel": "high",
  "verificationRequirements": ["id", "email"]
}
```

**Response Example**:
```json
{
  "message": "Election created successfully",
  "election": {
    "id": "election-789",
    "title": "Presidential Election 2024",
    "description": "National presidential election",
    "startDate": "2024-11-03T00:00:00.000Z",
    "endDate": "2024-11-03T23:59:59.000Z",
    "status": "upcoming",
    "resultVisibility": "immediate",
    "voterAnonymityLevel": "high",
    "verificationRequirements": ["id", "email"],
    "createdBy": "committee-123",
    "createdAt": "2023-05-01T12:34:56.789Z"
  }
}
```

#### GET `/elections`

Returns all elections.

**Authentication Required**: Yes

**Response Example**:
```json
[
  {
    "id": "election-789",
    "title": "Presidential Election 2024",
    "description": "National presidential election",
    "startDate": "2024-11-03T00:00:00.000Z",
    "endDate": "2024-11-03T23:59:59.000Z",
    "status": "upcoming",
    "resultVisibility": "immediate",
    "voterAnonymityLevel": "high",
    "verificationRequirements": ["id", "email"],
    "createdBy": "committee-123",
    "createdAt": "2023-05-01T12:34:56.789Z"
  },
  // Additional elections...
]
```

#### GET `/elections/:id`

Returns a specific election by ID.

**Authentication Required**: Yes

**Parameters**:
- `id`: The ID of the election to retrieve

**Response Example**:
```json
{
  "id": "election-789",
  "title": "Presidential Election 2024",
  "description": "National presidential election",
  "startDate": "2024-11-03T00:00:00.000Z",
  "endDate": "2024-11-03T23:59:59.000Z",
  "status": "upcoming",
  "resultVisibility": "immediate",
  "voterAnonymityLevel": "high",
  "verificationRequirements": ["id", "email"],
  "createdBy": "committee-123",
  "createdAt": "2023-05-01T12:34:56.789Z",
  "candidates": [
    // Candidates in this election...
  ],
  "statistics": {
    "totalEligibleVoters": 1000,
    "totalVotesCast": 0,
    "turnoutPercentage": 0
  }
}
```

#### PUT `/elections/:id`

Updates an existing election.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `id`: The ID of the election to update

**Request Body**:
```json
{
  "title": "Updated Presidential Election 2024",
  "description": "Updated national presidential election",
  "startDate": "2024-11-04T00:00:00.000Z",
  "endDate": "2024-11-04T23:59:59.000Z"
}
```

**Response Example**:
```json
{
  "message": "Election updated successfully",
  "election": {
    "id": "election-789",
    "title": "Updated Presidential Election 2024",
    "description": "Updated national presidential election",
    "startDate": "2024-11-04T00:00:00.000Z",
    "endDate": "2024-11-04T23:59:59.000Z",
    "status": "upcoming",
    "resultVisibility": "immediate",
    "voterAnonymityLevel": "high",
    "verificationRequirements": ["id", "email"],
    "createdBy": "committee-123",
    "createdAt": "2023-05-01T12:34:56.789Z",
    "updatedAt": "2023-05-02T10:11:12.131Z"
  }
}
```

#### DELETE `/elections/:id`

Deletes an election.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `id`: The ID of the election to delete

**Response Example**:
```json
{
  "message": "Election deleted successfully"
}
```

### Candidate Endpoints

#### POST `/elections/:electionId/candidates`

Adds a candidate to an election.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `electionId`: The ID of the election to add the candidate to

**Request Body**:
```json
{
  "name": "Jane Smith",
  "party": "Progressive Party",
  "biography": "Jane Smith is a seasoned politician with 20 years of experience...",
  "photoUrl": "https://example.com/photos/jane-smith.jpg"
}
```

**Response Example**:
```json
{
  "message": "Candidate added successfully",
  "candidate": {
    "id": "candidate-456",
    "name": "Jane Smith",
    "party": "Progressive Party",
    "biography": "Jane Smith is a seasoned politician with 20 years of experience...",
    "photoUrl": "https://example.com/photos/jane-smith.jpg",
    "electionId": "election-789",
    "createdAt": "2023-05-03T14:15:16.171Z"
  }
}
```

#### GET `/elections/:electionId/candidates`

Returns all candidates for a specific election.

**Authentication Required**: Yes

**Parameters**:
- `electionId`: The ID of the election to get candidates for

**Response Example**:
```json
[
  {
    "id": "candidate-456",
    "name": "Jane Smith",
    "party": "Progressive Party",
    "biography": "Jane Smith is a seasoned politician with 20 years of experience...",
    "photoUrl": "https://example.com/photos/jane-smith.jpg",
    "electionId": "election-789",
    "createdAt": "2023-05-03T14:15:16.171Z"
  },
  // Additional candidates...
]
```

#### PUT `/elections/:electionId/candidates/:candidateId`

Updates a candidate.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `electionId`: The ID of the election the candidate belongs to
- `candidateId`: The ID of the candidate to update

**Request Body**:
```json
{
  "name": "Jane Smith",
  "party": "Updated Progressive Party",
  "biography": "Updated biography for Jane Smith...",
  "photoUrl": "https://example.com/photos/jane-smith-new.jpg"
}
```

**Response Example**:
```json
{
  "message": "Candidate updated successfully",
  "candidate": {
    "id": "candidate-456",
    "name": "Jane Smith",
    "party": "Updated Progressive Party",
    "biography": "Updated biography for Jane Smith...",
    "photoUrl": "https://example.com/photos/jane-smith-new.jpg",
    "electionId": "election-789",
    "createdAt": "2023-05-03T14:15:16.171Z",
    "updatedAt": "2023-05-04T18:19:20.202Z"
  }
}
```

#### DELETE `/elections/:electionId/candidates/:candidateId`

Removes a candidate from an election.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `electionId`: The ID of the election the candidate belongs to
- `candidateId`: The ID of the candidate to remove

**Response Example**:
```json
{
  "message": "Candidate removed successfully"
}
```

### Voter Endpoints

#### POST `/voters/register`

Registers a new voter.

**Authentication Required**: No

**Request Body**:
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1234567890",
  "password": "securePassword456",
  "idDocument": "base64-encoded-image-data",
  "selfie": "base64-encoded-image-data"
}
```

**Response Example**:
```json
{
  "message": "Voter registration submitted successfully. Awaiting verification.",
  "voterId": "voter-123"
}
```

#### POST `/voters/login`

Authenticates a voter and returns a JWT token.

**Authentication Required**: No

**Request Body**:
```json
{
  "email": "alice.johnson@example.com",
  "password": "securePassword456"
}
```

**Response Example**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "voter": {
    "id": "voter-123",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "verificationStatus": "verified"
  }
}
```

#### GET `/voters/profile`

Returns the profile of the authenticated voter.

**Authentication Required**: Yes (Voter)

**Response Example**:
```json
{
  "id": "voter-123",
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1234567890",
  "verificationStatus": "verified",
  "createdAt": "2023-02-01T00:00:00.000Z"
}
```

#### GET `/voters/eligible-elections`

Returns all elections the authenticated voter is eligible to vote in.

**Authentication Required**: Yes (Voter)

**Response Example**:
```json
[
  {
    "id": "election-789",
    "title": "Presidential Election 2024",
    "description": "National presidential election",
    "startDate": "2024-11-03T00:00:00.000Z",
    "endDate": "2024-11-03T23:59:59.000Z",
    "status": "upcoming",
    "hasVoted": false
  },
  // Additional eligible elections...
]
```

#### POST `/voters/vote`

Casts a vote in an election.

**Authentication Required**: Yes (Voter)

**Request Body**:
```json
{
  "electionId": "election-789",
  "candidateId": "candidate-456"
}
```

**Response Example**:
```json
{
  "message": "Vote cast successfully",
  "transactionId": "tx-790",
  "voteId": "vote-101112"
}
```

#### GET `/voters/vote/:voteId`

Verifies a vote by its ID.

**Authentication Required**: Yes (Voter)

**Parameters**:
- `voteId`: The ID of the vote to verify

**Response Example**:
```json
{
  "verified": true,
  "vote": {
    "id": "vote-101112",
    "electionId": "election-789",
    "transactionId": "tx-790",
    "timestamp": "2024-11-03T12:34:56.789Z",
    "blockIndex": 3,
    "blockHash": "0000d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9"
  }
}
```

### Committee Admin Endpoints

#### GET `/committee/voters`

Returns all registered voters.

**Authentication Required**: Yes (Committee)

**Response Example**:
```json
[
  {
    "id": "voter-123",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "+1234567890",
    "verificationStatus": "verified",
    "createdAt": "2023-02-01T00:00:00.000Z"
  },
  // Additional voters...
]
```

#### PUT `/committee/voters/:voterId/verify`

Verifies a voter's identity.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `voterId`: The ID of the voter to verify

**Request Body**:
```json
{
  "verificationStatus": "verified"
}
```

**Response Example**:
```json
{
  "message": "Voter verified successfully",
  "voter": {
    "id": "voter-123",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "verificationStatus": "verified",
    "updatedAt": "2023-02-02T12:34:56.789Z"
  }
}
```

#### GET `/committee/election-results/:electionId`

Returns detailed results for a specific election.

**Authentication Required**: Yes (Committee)

**Parameters**:
- `electionId`: The ID of the election to get results for

**Response Example**:
```json
{
  "electionId": "election-789",
  "title": "Presidential Election 2024",
  "totalEligibleVoters": 1000,
  "totalVotesCast": 750,
  "turnoutPercentage": 75,
  "results": [
    {
      "candidateId": "candidate-456",
      "name": "Jane Smith",
      "party": "Progressive Party",
      "voteCount": 400,
      "percentage": 53.33
    },
    {
      "candidateId": "candidate-457",
      "name": "John Doe",
      "party": "Conservative Party",
      "voteCount": 350,
      "percentage": 46.67
    }
  ],
  "geographicDistribution": {
    // Geographic voting data...
  },
  "timeDistribution": {
    // Voting time data...
  }
}
```

## Error Responses

All API endpoints return standard error responses in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED`: User is not authenticated
- `INVALID_CREDENTIALS`: Invalid login credentials
- `FORBIDDEN`: User does not have permission for the requested operation
- `NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Request validation failed
- `ALREADY_EXISTS`: Resource already exists
- `BLOCKCHAIN_ERROR`: Error in blockchain operations
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limits are exceeded, the API will return a 429 Too Many Requests response with a Retry-After header indicating when to retry.

## Webhooks

The API supports webhooks for real-time notifications of important events. To register a webhook:

```
POST /webhooks/register
```

With the following request body:

```json
{
  "url": "https://your-server.com/webhook-endpoint",
  "events": ["election.started", "election.ended", "vote.cast"],
  "secret": "your-webhook-secret"
}
```

Webhook payloads are signed using HMAC-SHA256 with your secret. Verify the signature in the X-Chainocracy-Signature header to ensure the webhook is authentic.
