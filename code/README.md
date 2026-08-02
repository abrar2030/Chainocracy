# QuantumBallot / Code Directory

This directory contains the core backend and blockchain implementations for the QuantumBallot platform. These modules power the secure, transparent, and tamper-proof election management system.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Backend](#backend)
  - [Architecture](#backend-architecture)
  - [Source Modules](#source-modules)
  - [Configuration](#configuration)
  - [Testing](#backend-testing)
  - [Docker Support](#docker-support)
- [Blockchain](#blockchain)
  - [Architecture](#blockchain-architecture)
  - [Core Components](#core-components)
  - [Smart Contracts](#smart-contracts)
  - [Testing](#blockchain-testing)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running the Backend](#running-the-backend)
  - [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Security](#security)

---

## Overview

The `code/` directory houses two primary systems:

| Module        | Purpose                                                 | Language             |
| ------------- | ------------------------------------------------------- | -------------------- |
| `backend/`    | REST API server, authentication, email, P2P networking  | TypeScript (Node.js) |
| `blockchain/` | Custom blockchain engine, smart contracts, cryptography | TypeScript / Rust    |

The backend exposes HTTP endpoints for the web and mobile frontends, handles voter authentication, committee operations, and delegates vote recording to the blockchain module. The blockchain layer provides an immutable ledger, cryptographic vote verification, and smart contract enforcement of election rules.

---

## Directory Structure

```
code/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── blockchain.route.ts    # Blockchain interaction routes
│   │   │   │   └── committee.route.ts     # Committee management routes
│   │   │   └── index.ts
│   │   ├── committee/
│   │   │   ├── committee.ts               # Committee business logic
│   │   │   └── data_types.ts              # Committee data models
│   │   ├── config/
│   │   │   ├── allowedOrigins.ts          # CORS origin whitelist
│   │   │   ├── coreOptions.ts             # Core configuration options
│   │   │   └── index.ts
│   │   ├── email_center/                  # Email notification service
│   │   ├── middleware/
│   │   │   ├── credentials.ts             # Credential handling middleware
│   │   │   ├── verifyJWT.ts               # JWT verification (mobile)
│   │   │   └── verifyJWTWeb.ts            # JWT verification (web)
│   │   ├── network/
│   │   │   ├── ips.dat                    # Known peer IP addresses
│   │   │   ├── network.ts                 # Network management
│   │   │   ├── p2p.ts                     # Peer-to-peer communication
│   │   │   └── start_network.sh           # Network bootstrap script
│   │   └── index.ts                       # Express server entry point
│   ├── tests/
│   │   ├── mocks/                         # Test mock data
│   │   ├── api.test.js                    # API integration tests
│   │   ├── committee.test.js             # Committee module tests
│   │   └── middleware.test.js            # Middleware unit tests
│   ├── .env.example                       # Environment variable template
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── Dockerfile                         # Multi-stage container build
│   ├── Makefile
│   ├── babel.config.js
│   ├── docker-compose.yml
│   ├── eslint.config.js
│   ├── jest.config.cjs                    # Jest test configuration
│   ├── jest.setup.js
│   ├── package.json
│   ├── setup.sh                           # Setup automation script
│   ├── simple.test.js
│   └── tsconfig.json
├── blockchain/
│   ├── src/
│   │   ├── core/
│   │   │   ├── blockchain.ts              # Main blockchain engine (517 lines)
│   │   │   └── data_types.ts              # Core type definitions
│   │   ├── crypto/
│   │   │   └── cryptoBlockchain.ts        # Cryptographic primitives
│   │   ├── leveldb/
│   │   │   └── index.ts                   # LevelDB persistence layer
│   │   ├── smart_contract/
│   │   │   ├── README.md
│   │   │   ├── smart_contract.rs          # Rust smart contract impl
│   │   │   ├── smart_contract.ts          # TypeScript smart contract impl
│   │   │   └── voting_mechanisms.rs       # Rust voting mechanisms
│   │   └── tests/
│   └── tests/
│       ├── smart_contract/
│       ├── UnitTesting.test.ts
│       ├── blockchain.test.js
│       └── crypto.test.js
```

---

## Backend

### Backend Architecture

The backend follows a layered architecture built on Express.js with TypeScript:

1. **Entry Point** (`src/index.ts`): Bootstraps the Express application, initializes middleware, connects to LevelDB, and mounts route handlers.
2. **Routes** (`src/api/routes/`): Define REST endpoint paths and delegate to internal modules.
3. **Committee Module** (`src/committee/`): Contains election management logic, candidate registration, and voter verification workflows.
4. **Middleware** (`src/middleware/`): Cross-cutting concerns including JWT verification for web and mobile clients, and credential processing.
5. **Network** (`src/network/`): Peer-to-peer network layer for blockchain node discovery and communication.
6. **Email Center** (`src/email_center/`): Transactional email delivery for voter notifications and verification codes.

### Source Modules

#### `src/index.ts`

The main server file that:

- Configures Express with JSON and URL-encoded body parsing
- Sets up CORS with a whitelist of allowed origins
- Initializes the blockchain connection to LevelDB
- Validates required environment variables at startup
- Mounts API routes under the appropriate paths
- Runs on port 3000 by default (configurable via `PORT` env var)

#### `src/api/routes/`

| File                  | Purpose                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `blockchain.route.ts` | Endpoints for chain queries, block submission, vote recording, and result retrieval        |
| `committee.route.ts`  | Endpoints for election CRUD, candidate management, voter registration, and audit functions |

#### `src/committee/`

| File            | Purpose                                                                               |
| --------------- | ------------------------------------------------------------------------------------- |
| `committee.ts`  | Core committee logic: election lifecycle, candidate management, voter roll management |
| `data_types.ts` | TypeScript interfaces for committee operations and election data structures           |

#### `src/middleware/`

| File              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `credentials.ts`  | Extracts and processes authentication credentials from requests |
| `verifyJWT.ts`    | Verifies JSON Web Tokens for mobile API clients                 |
| `verifyJWTWeb.ts` | Verifies JSON Web Tokens for web dashboard clients              |

#### `src/network/`

| File               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `network.ts`       | Manages network topology and node registration                |
| `p2p.ts`           | Handles peer-to-peer message passing between blockchain nodes |
| `ips.dat`          | Static list of known peer node IP addresses                   |
| `start_network.sh` | Shell script to bootstrap the P2P network cluster             |

#### `src/config/`

| File                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `allowedOrigins.ts` | Whitelist of frontend origins permitted through CORS |
| `coreOptions.ts`    | Application-level configuration constants            |
| `index.ts`          | Config module barrel exports                         |

### Configuration

Copy `.env.example` to `.env` and configure the following variables:

| Variable                | Description                               | Example                   |
| ----------------------- | ----------------------------------------- | ------------------------- |
| `PORT`                  | Server listen port                        | `3000`                    |
| `NODE_ENV`              | Runtime environment                       | `development`             |
| `ACCESS_TOKEN_SECRET`   | JWT signing secret (64+ chars)            | (generate with crypto)    |
| `REFRESH_TOKEN_SECRET`  | JWT refresh secret (64+ chars)            | (generate with crypto)    |
| `SECRET_KEY_IDENTIFIER` | 32-byte hex key for identifier encryption | (64 hex chars)            |
| `SECRET_IV_IDENTIFIER`  | 16-byte hex IV for identifier encryption  | (32 hex chars)            |
| `SECRET_KEY_VOTES`      | 32-byte hex key for vote encryption       | (64 hex chars)            |
| `SECRET_IV_VOTES`       | 16-byte hex IV for vote encryption        | (32 hex chars)            |
| `MAILER_SERVICE`        | Email service provider                    | `gmail`                   |
| `MAILER_HOST`           | SMTP host                                 | `smtp.gmail.com`          |
| `MAILER_PORT`           | SMTP port                                 | `587`                     |
| `MAILER_USER`           | SMTP username                             | `your_email@example.com`  |
| `MAILER_PASS`           | SMTP password / app password              | `your_app_password`       |
| `DB_PATH`               | LevelDB storage path                      | `./data/QuantumBallot_db` |

### Backend Testing

Test files are located in `backend/tests/`:

| Test File            | Coverage                                         |
| -------------------- | ------------------------------------------------ |
| `api.test.js`        | REST API endpoint integration tests              |
| `committee.test.js`  | Committee logic and election workflow tests      |
| `middleware.test.js` | JWT verification and credential middleware tests |
| `mocks/`             | Mock data fixtures for test scenarios            |

Run tests with: `npm test`

### Docker Support

The `Dockerfile` implements a multi-stage build:

1. **Builder stage**: Installs all dependencies (including devDependencies), compiles TypeScript to JavaScript
2. **Production stage**: Copies only production `node_modules` and compiled `dist/` output, runs as non-root `node` user, includes a health check on port 3000

Supporting files:

- `docker-compose.yml`: Compose definition for local development and deployment
- `Makefile`: Shortcuts for common Docker operations
- `setup.sh`: Automated dependency installation and environment preparation

---

## Blockchain

### Blockchain Architecture

The blockchain module is a custom implementation written in TypeScript with critical components also available in Rust. It provides:

- Proof of Work consensus mechanism
- SHA-256 cryptographic hashing for block integrity
- AES encryption for sensitive voter identifiers and vote payloads
- LevelDB persistence for chain storage
- Smart contract enforcement of election rules
- Double-voting prevention through cryptographic verification
- P2P network propagation of new blocks

### Core Components

#### `src/core/blockchain.ts`

The main blockchain engine (517 lines) implementing:

- `BlockChain` class with chain initialization from genesis block
- Block mining with configurable difficulty target
- Transaction pool management
- Chain persistence to / loading from LevelDB
- Vote validation via smart contract integration
- Two `CryptoBlockchain` instances: one for voter identifiers, one for vote payloads

#### `src/core/data_types.ts`

Core type definitions:

| Interface         | Description                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `BlockHeader`     | Block metadata: version, hash, previous hash, merkle root, timestamp, difficulty, nonce      |
| `Block`           | Complete block: index, size, header, transaction count, transaction list                     |
| `Transaction`     | A single transaction wrapping a `Voter` data payload                                         |
| `Voter`           | Voter record: identifier, encrypted electoral ID, choice code, vote state, secret, timestamp |
| `Candidate`       | Candidate record: name, vote count, code, acronym, party affiliation, status                 |
| `Results`         | Aggregated election results: timing, winner, candidate breakdowns, geographic stats          |
| `CandidateResult` | Per-candidate result: vote count, percentage, candidate reference                            |
| `HashMap<T>`      | Generic key-value hash map type                                                              |

#### `src/crypto/cryptoBlockchain.ts`

Cryptographic layer providing:

- SHA-256 hashing for block and transaction integrity
- AES-256 encryption/decryption for sensitive data fields
- Digital signature verification
- Merkle root computation

#### `src/leveldb/index.ts`

LevelDB persistence layer:

- Chain write and read operations
- Voter-citizen relationship indexing
- Candidate deployment storage
- Chain state snapshots

### Smart Contracts

Located in `src/smart_contract/`:

| File                   | Language   | Purpose                                                           |
| ---------------------- | ---------- | ----------------------------------------------------------------- |
| `smart_contract.ts`    | TypeScript | Core voting rules, candidate registration, voter verification     |
| `smart_contract.rs`    | Rust       | High-performance equivalent for production blockchain deployments |
| `voting_mechanisms.rs` | Rust       | Advanced voting mechanisms with Sybil resistance                  |

The smart contracts enforce:

- Eligible voter verification before vote acceptance
- Prevention of double voting
- Candidate registration and validation
- Vote counting and winner determination
- Election timing constraints (start/end enforcement)

### Blockchain Testing

Located in `blockchain/tests/`:

| Test File             | Coverage                                          |
| --------------------- | ------------------------------------------------- |
| `UnitTesting.test.ts` | TypeScript unit tests for chain operations        |
| `blockchain.test.js`  | Blockchain integrity, mining, and consensus tests |
| `crypto.test.js`      | Cryptographic primitive validation                |
| `smart_contract/`     | Smart contract logic and rule enforcement tests   |

---

## Getting Started

### Prerequisites

- Node.js 18+ (20 recommended)
- npm 9+ or yarn
- Git

### Environment Setup

The `backend` package imports TypeScript sources directly from the sibling
`blockchain` package, so both are managed as one npm workspace rooted at
`code/`. Install from `code/` so dependencies for both packages (including
`crypto-js`, used by `blockchain/src/core/blockchain.ts`) get installed:

```bash
cd code
npm install
cd backend
cp .env.example .env
# Edit .env with your secrets and configuration
```

(Running `npm install` only inside `code/backend` will skip the
`blockchain` package's own dependencies and cause `Cannot find module
'crypto-js/sha256'` when starting the backend.)

### Running the Backend

Development mode with hot reload:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

Docker:

```bash
npm run docker:build
npm run docker:up
```

### Running Tests

Backend tests:

```bash
cd code/backend
npm test
```

Blockchain tests:

```bash
cd code/blockchain
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

---

## API Endpoints

The backend exposes REST endpoints grouped into two main route modules:

**Blockchain Routes (`/api/blockchain/*`)**

- Chain inspection and block retrieval
- Vote submission and recording
- Election results and statistics
- Block verification

**Committee Routes (`/api/committee/*`)**

- Election creation and configuration
- Candidate registration and management
- Voter roll import and verification
- Audit trail access
- Real-time election monitoring (via Socket.IO)

---

## Technology Stack

| Layer           | Technology        | Version     |
| --------------- | ----------------- | ----------- |
| Runtime         | Node.js           | 18+         |
| Language        | TypeScript        | 5.4+        |
| Framework       | Express           | 4.18+       |
| Database        | LevelDB           | 8.0+        |
| Auth            | JWT + bcrypt      | 9.0+ / 5.1+ |
| Real-time       | Socket.IO         | 4.7+        |
| Crypto          | crypto-js         | 4.1+        |
| Email           | Nodemailer        | 6.9+        |
| 2FA             | speakeasy         | 2.0+        |
| QR Codes        | qrcode            | 1.5+        |
| Testing         | Jest + Supertest  | 29+ / 6+    |
| Docker          | node:20-alpine    | 20          |
| Smart Contracts | TypeScript / Rust |             |

---

## Security

- **Encryption at rest**: All voter identifiers and vote payloads are AES-256 encrypted before storage
- **Transport security**: CORS restricted to whitelisted origins; JWT tokens required for all protected endpoints
- **Double-vote prevention**: Smart contracts cryptographically verify each voter has not previously voted
- **Immutable audit trail**: Blockchain structure prevents tampering with historical vote records
- **Credential isolation**: Separate encryption keys for identifiers and votes
- **Two-factor authentication**: Optional TOTP-based 2FA for committee member accounts
- **Non-root container execution**: Docker production stage runs as the `node` user
- **Health checks**: Docker container includes periodic health endpoint probes
