# Chainocracy

A full-stack Web and Mobile application for American elections using Blockchain Technology. The system presents a user-friendly interface accessible via both web browsers and mobile platforms.

<div align="center">
  <img src="Chainocracy.bmp" alt="Cross-Chain Asset Management" width="100%">
</div>

> **Note**: This Project is currently under active development. Features and functionalities are being added and improved continuously to enhance user experience.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Security](#security)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

Chainocracy is a comprehensive election management system that leverages blockchain technology to ensure secure, transparent, and tamper-proof elections in America. The platform consists of multiple components:

- **Web Frontend**: For election committee members and administrators
- **Mobile Frontend**: For voters to cast their votes securely
- **Backend API**: Handles business logic and blockchain operations
- **Blockchain Implementation**: Core technology ensuring election integrity

The system allows committee members to seamlessly access the application through their browsers, while voters have the convenience of utilizing their smartphones, whether running on iOS or Android.

## Project Structure

The project is organized into several main components:

```
chainocracy/
├── backend-api/           
├── docs/                  
├── mobile-frontend/       
├── public/                
└── web-frontend/          
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

### Documentation

Comprehensive documentation using Sphinx, including:

- API documentation
- System architecture
- User guides
- Security protocols

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

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/abrar2030/chainocracy.git
cd chainocracy/backend-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Web Frontend Setup
```bash
cd ../web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Mobile Frontend Setup
```bash
cd ../mobile-frontend

# Install dependencies
npm install

# Start Expo development server
npm start
```

## Usage

### Committee Member Portal (Web)
1. Access the web application through a browser
2. Log in with committee credentials
3. Set up elections, add candidates, and configure parameters
4. Monitor voting progress and results
5. Verify and validate election integrity through blockchain explorer

### Voter Application (Mobile)
1. Download and install the mobile application
2. Register or log in with voter credentials
3. View active elections and candidate information
4. Cast vote securely
5. Receive confirmation of vote submission
6. View election results when published

## Security

Chainocracy implements multiple layers of security:

- **Blockchain Technology**: Ensures immutability and transparency of votes
- **Encryption**: All sensitive data is encrypted at rest and in transit
- **Authentication**: Multi-factor authentication for all users
- **Authorization**: Role-based access control
- **Audit Trails**: Comprehensive logging of all system activities
- **Verification**: QR code and cryptographic verification of voter identity

## Documentation

Comprehensive documentation is available in the `docs` directory. To build and view the documentation:

```bash
cd docs
make html
```

## Contributing

We welcome contributions to Chainocracy! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

---
