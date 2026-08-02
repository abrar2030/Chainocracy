# Installation Guide

Complete installation instructions for QuantumBallot on all supported platforms.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation by Platform](#installation-by-platform)
4. [Backend Setup](#backend-setup)
5. [Web Frontend Setup](#web-frontend-setup)
6. [Mobile Frontend Setup](#mobile-frontend-setup)
7. [Docker Installation](#docker-installation)
8. [Verification](#verification)

---

## System Requirements

| Component | Minimum                   | Recommended                       |
| --------- | ------------------------- | --------------------------------- |
| OS        | Linux, macOS, Windows 10+ | Ubuntu 20.04+, macOS 12+          |
| CPU       | 2 cores                   | 4+ cores                          |
| RAM       | 4 GB                      | 8+ GB                             |
| Storage   | 10 GB free                | 20+ GB free (for blockchain data) |
| Node.js   | 16.x                      | 18.x or 20.x LTS                  |
| npm       | 7.x                       | 9.x or later                      |

---

## Prerequisites

Before installing QuantumBallot, ensure you have the following installed:

### Required Tools

1. **Node.js** (v16 or later)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** or **yarn**
   - npm comes with Node.js
   - Verify: `npm --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

### Optional Tools

- **Docker** (for containerized deployment)
- **Expo CLI** (for mobile development): `npm install -g expo-cli`
- **TypeScript** (globally, optional): `npm install -g typescript`

---

## Installation by Platform

### Ubuntu / Debian Linux

```bash
# Update package list
sudo apt update

# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Verify installations
node --version
npm --version
git --version

# Clone repository
git clone https://github.com/quantsingularity/QuantumBallot.git
cd QuantumBallot
```

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and Git
brew install node git

# Verify installations
node --version
npm --version
git --version

# Clone repository
git clone https://github.com/quantsingularity/QuantumBallot.git
cd QuantumBallot
```

### Windows 10/11

```powershell
# Install via Chocolatey (recommended) or download installers manually

# Install Chocolatey (run PowerShell as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js and Git
choco install nodejs git -y

# Verify installations
node --version
npm --version
git --version

# Clone repository
git clone https://github.com/quantsingularity/QuantumBallot.git
cd QuantumBallot
```

---

## Installation Steps Summary

| OS / Platform     | Recommended install command                                                                         | Notes                                    |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Ubuntu 20.04+** | `curl -fsSL https://deb.nodesource.com/setup_18.x \| sudo bash - && sudo apt install -y nodejs git` | Use NodeSource for latest Node.js        |
| **macOS 12+**     | `brew install node git`                                                                             | Requires Homebrew package manager        |
| **Windows 10+**   | `choco install nodejs git -y`                                                                       | Requires Chocolatey or manual installers |
| **Docker**        | `docker-compose up --build`                                                                         | See Docker Installation section          |
| **Raspberry Pi**  | Same as Ubuntu, ARM-compatible Node.js                                                              | May require additional swap memory       |

---

## Backend Setup

### Step 1: Navigate to the Code Workspace

The backend imports TypeScript sources directly from the sibling `blockchain`
package, so the two are managed as a single npm workspace rooted at `code/`.
Install once from there rather than from `backend/` alone:

```bash
cd QuantumBallot/code
```

### Step 2: Install Dependencies

```bash
npm install
```

Running `npm install` from `code/` installs and hoists dependencies for
**both** the `backend` and `blockchain` workspace packages into a single
`code/node_modules`, including:

- Express (web framework)
- TypeScript (type safety)
- LevelDB (blockchain storage)
- Socket.IO (real-time communication)
- bcrypt, jsonwebtoken (authentication)
- crypto-js (encryption, used by both `backend` and `blockchain`)

Running `npm install` only inside `code/backend` will leave the `blockchain`
package's own dependencies (e.g. `crypto-js`) uninstalled, which causes
`Cannot find module 'crypto-js/sha256'` when starting the backend.

You can still run backend scripts from `code/backend` as before (e.g.
`cd code/backend && npm start`), or use the workspace shortcuts from
`code/`: `npm start`, `npm run dev`, `npm run build`.

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use any text editor
```

**Required environment variables:**

| Option                  | Type   | Default                   | Description                                         | Where to set (env/file) |
| ----------------------- | ------ | ------------------------- | --------------------------------------------------- | ----------------------- |
| `PORT`                  | number | 3000                      | Server port                                         | `.env`                  |
| `NODE_ENV`              | string | development               | Environment mode                                    | `.env`                  |
| `JWT_SECRET`            | string | -                         | JWT signing secret (min 32 chars)                   | `.env`                  |
| `ACCESS_TOKEN_SECRET`   | string | -                         | Access token secret (min 32 chars)                  | `.env`                  |
| `DB_PATH`               | string | `./data/QuantumBallot_db` | LevelDB storage path                                | `.env`                  |
| `SECRET_KEY_IDENTIFIER` | string | -                         | Blockchain identifier encryption key (64 hex chars) | `.env`                  |
| `SECRET_IV_IDENTIFIER`  | string | -                         | Blockchain identifier IV (32 hex chars)             | `.env`                  |
| `SECRET_KEY_VOTES`      | string | -                         | Vote encryption key (64 hex chars)                  | `.env`                  |
| `SECRET_IV_VOTES`       | string | -                         | Vote encryption IV (32 hex chars)                   | `.env`                  |
| `MAILER_SERVICE`        | string | gmail                     | Email service provider                              | `.env`                  |
| `MAILER_HOST`           | string | smtp.gmail.com            | SMTP host                                           | `.env`                  |
| `MAILER_PORT`           | number | 587                       | SMTP port                                           | `.env`                  |
| `MAILER_USER`           | string | -                         | Email account username                              | `.env`                  |
| `MAILER_PASS`           | string | -                         | Email account password                              | `.env`                  |

**Generate encryption keys:**

```bash
# Generate SECRET_KEY_IDENTIFIER and SECRET_KEY_VOTES
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SECRET_IV_IDENTIFIER and SECRET_IV_VOTES
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 4: Build TypeScript

```bash
npm run build
```

### Step 5: Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

**Verify backend is running:**

```bash
curl http://localhost:3000/health
# Expected output: {"status":"ok","timestamp":"2025-12-30T...","uptime":...}
```

---

## Web Frontend Setup

### Step 1: Navigate to Web Frontend

```bash
cd QuantumBallot/web-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
```

**Required variables:**

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Step 4: Start Development Server

```bash
npm run dev
```

Web app starts at `http://localhost:5173` (Vite default)

---

## Mobile Frontend Setup

### Step 1: Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
```

### Step 2: Navigate to Mobile Frontend

```bash
cd QuantumBallot/mobile-frontend
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
nano .env
```

**Required variables:**

```env
API_URL=http://192.168.1.100:3000/api
SOCKET_URL=http://192.168.1.100:3000
```

**Note**: Replace `192.168.1.100` with your computer's local IP address (not localhost).

### Step 5: Start Expo Development Server

```bash
npm start
# or
expo start
```

Scan QR code with Expo Go app (iOS/Android) to run on device.

---

## Docker Installation

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/quantsingularity/QuantumBallot.git
cd QuantumBallot

# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop services
docker-compose down
```

### Services Available

| Service      | Port | Description         |
| ------------ | ---- | ------------------- |
| Backend API  | 3000 | Node.js/Express API |
| Web Frontend | 5173 | Vite dev server     |
| LevelDB      | -    | Embedded database   |

---

## Verification

### 1. Verify Backend

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# Blockchain status
curl http://localhost:3000/api/blockchain/chain
```

### 2. Verify Web Frontend

Open browser: `http://localhost:5173`

Expected: Login page for committee members

### 3. Verify Mobile Frontend

Open Expo Go app → Scan QR code

Expected: Voter login screen

### 4. Run Tests

```bash
# Backend tests
cd backend
npm test

# Web frontend tests
cd web-frontend
npm test

# Mobile frontend tests
cd mobile-frontend
npm test
```

---

## Common Installation Issues

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common installation problems.

---

## Next Steps

- **Configure your election**: See [USAGE.md](USAGE.md)
- **Deploy to production**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Learn the API**: See [API.md](API.md)
- **Understand architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)

---

_Installation complete! For usage instructions, see [USAGE.md](USAGE.md)._
