# QuantumBallot

![CI/CD Status](https://img.shields.io/github/actions/workflow/status/quantsingularity/QuantumBallot/cicd.yml?branch=main&label=CI/CD&logo=github)
[![Test Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)](https://github.com/quantsingularity/QuantumBallot/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A full-stack Web and Mobile application for American elections using Blockchain Technology. The system presents a user-friendly interface accessible via both web browsers and mobile platforms.

<div align="center">
  <img src="docs/images/QuantumBallot_dashboard.bmp" alt="QuantumBallot Election System" width="100%">
</div>

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Security](#security)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

QuantumBallot is a comprehensive election management system that leverages blockchain technology to ensure secure, transparent, and tamper-proof elections in America. The system allows committee members to seamlessly access the application through their browsers, while voters have the convenience of utilizing their smartphones, whether running on iOS or Android.

## Project Structure

The project is organized into several main components:

```
QuantumBallot/
├── code/                   # Core backend logic, services, and shared utilities
├── docs/                   # Project documentation
├── infrastructure/         # DevOps, deployment, and infra-related code
├── mobile-frontend/        # Mobile application
├── web-frontend/           # Web dashboard
├── scripts/                # Automation, setup, and utility scripts
├── LICENSE                 # License information
└── README.md               # Project overview and instructions
```

### Backend API

The backend is built with Node.js and TypeScript, providing RESTful APIs for both web and mobile clients. It includes:

- Blockchain implementation
- Authentication and authorization
- Election management
- Vote processing and verification
- Real-time updates via Socket.IO

### Web Frontend

A React-based web application with TypeScript and Tailwind CSS, designed for election committee members to:

- Manage elections
- Monitor voting progress
- View election results
- Manage candidates
- Verify voter identities
- Access blockchain details for transparency

### Mobile Frontend

A React Native application for voters that provides:

- Secure authentication
- Candidate information
- Voting interface
- QR code scanning for verification
- Real-time election updates
- Vote confirmation

## Features

### Election Management

- Create and configure elections
- Set election parameters (start/end dates, eligible voters)
- Add and manage candidates
- Monitor election progress in real-time

### Voter Experience

- Secure voter registration and authentication
- View candidate information
- Cast votes securely
- Verify vote submission
- View election results

### Blockchain Integration

- Immutable record of all votes
- Transparent verification process
- Prevention of double-voting
- Cryptographic security
- Decentralized validation

### Security Features

- Two-factor authentication
- Encryption of sensitive data
- QR code verification
- Audit trails
- Secure key management

### Analytics and Reporting

- Real-time election statistics
- Voter turnout analysis
- Geographic voting patterns
- Result visualization
- Exportable reports

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: LevelDB (for blockchain)
- **Authentication**: JWT, bcrypt
- **Real-time Communication**: Socket.IO
- **Other Libraries**: crypto-js, nodemailer, qrcode, speakeasy

### Web Frontend

- **Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS, SCSS
- **State Management**: React Query
- **UI Components**: Radix UI, Material UI
- **Data Visualization**: Recharts, MUI X-Charts
- **Form Handling**: React Hook Form, Zod
- **Testing**: Vitest, Testing Library

### Mobile Frontend

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Authentication**: Expo Secure Store
- **Camera/QR**: Expo Camera, Expo Barcode Scanner
- **Other**: React Native SVG, Vector Icons

### Blockchain

- Custom implementation with:
  - Proof of Work consensus
  - Cryptographic hashing
  - Digital signatures
  - Distributed ledger
  - Smart contracts for election rules

## Installation and Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI (for mobile development)
- Git

```bash
# Clone the repository
git clone https://github.com/quantsingularity/QuantumBallot.git
cd QuantumBallot/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Testing

The project maintains comprehensive test coverage across all components to ensure reliability and stability.

### Test Coverage

| Component       | Coverage | Status |
| --------------- | -------- | ------ |
| Backend API     | 92%      | ✅     |
| Web Frontend    | 85%      | ✅     |
| Mobile Frontend | 83%      | ✅     |
| Blockchain Core | 90%      | ✅     |
| Overall         | 87%      | ✅     |

### Running Tests

```bash
# Run backend tests
cd backend
npm test

# Run web frontend tests
cd web-frontend
npm test

# Run mobile frontend tests
cd mobile-frontend
npm test
```

### Testing Strategy

- **Unit Tests**: Testing individual functions and components
- **Integration Tests**: Testing interactions between different modules
- **E2E Tests**: Testing complete user flows
- **Contract Tests**: Ensuring API contracts are maintained

## CI/CD Pipeline

QuantumBallot uses GitHub Actions for continuous integration and deployment:

| Stage                | Control Area                    | Institutional-Grade Detail                                                              |
| :------------------- | :------------------------------ | :-------------------------------------------------------------------------------------- |
| **Formatting Check** | Change Triggers                 | Enforced on all `push` and `pull_request` events to `main` and `develop`                |
|                      | Manual Oversight                | On-demand execution via controlled `workflow_dispatch`                                  |
|                      | Source Integrity                | Full repository checkout with complete Git history for auditability                     |
|                      | Python Runtime Standardization  | Python 3.10 with deterministic dependency caching                                       |
|                      | Backend Code Hygiene            | `autoflake` to detect unused imports/variables using non-mutating diff-based validation |
|                      | Backend Style Compliance        | `black --check` to enforce institutional formatting standards                           |
|                      | Non-Intrusive Validation        | Temporary workspace comparison to prevent unauthorized source modification              |
|                      | Node.js Runtime Control         | Node.js 18 with locked dependency installation via `npm ci`                             |
|                      | Web Frontend Formatting Control | Prettier checks for web-facing assets                                                   |
|                      | Mobile Frontend Formatting      | Prettier enforcement for mobile application codebases                                   |
|                      | Documentation Governance        | Repository-wide Markdown formatting enforcement                                         |
|                      | Infrastructure Configuration    | Prettier validation for YAML/YML infrastructure definitions                             |
|                      | Compliance Gate                 | Any formatting deviation fails the pipeline and blocks merge                            |

## Documentation

| Document                    | Path                 | Description                                                    |
| :-------------------------- | :------------------- | :------------------------------------------------------------- |
| **README**                  | `README.md`          | High-level overview, project scope, and repository entry point |
| **Installation Guide**      | `INSTALLATION.md`    | Step-by-step installation and environment setup                |
| **API Reference**           | `API.md`             | Detailed documentation for all API endpoints                   |
| **CLI Reference**           | `CLI.md`             | Command-line interface usage, commands, and examples           |
| **User Guide**              | `USAGE.md`           | Comprehensive end-user guide, workflows, and examples          |
| **Architecture Overview**   | `ARCHITECTURE.md`    | System architecture, components, and design rationale          |
| **Configuration Guide**     | `CONFIGURATION.md`   | Configuration options, environment variables, and tuning       |
| **Feature Matrix**          | `FEATURE_MATRIX.md`  | Feature coverage, capabilities, and roadmap alignment          |
| **Contributing Guidelines** | `CONTRIBUTING.md`    | Contribution workflow, coding standards, and PR requirements   |
| **Troubleshooting**         | `TROUBLESHOOTING.md` | Common issues, diagnostics, and remediation steps              |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
