# Installation Guide

This guide provides step-by-step instructions for setting up the Chainocracy blockchain-based voting system in a development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16+)
- **npm** or **yarn** package manager
- **Expo CLI** (for mobile development)
- **Git** version control

## Backend API Setup

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/abrar2030/chainocracy.git
cd chainocracy
```

### Install Backend Dependencies

```bash
# Navigate to the backend directory
cd backend-api

# Install dependencies
npm install
# or
yarn install
```

### Configure Environment Variables

```bash
# Create environment file from example
cp .env.example .env

# Edit the .env file with your configuration
# You'll need to set:
# - PORT (default: 3010)
# - JWT_SECRET
# - BLOCKCHAIN_NODE_ADDRESS
# - DATABASE_PATH
# - EMAIL_SERVICE settings (if using email notifications)
```

### Start the Backend Server

```bash
# Start in development mode
npm run dev
# or
yarn dev

# Start in production mode
npm start
# or
yarn start
```

The backend server will start on the configured port (default: 3010).

## Web Frontend Setup

### Install Web Frontend Dependencies

```bash
# Navigate to the web frontend directory
cd ../web-frontend

# Install dependencies
npm install
# or
yarn install
```

### Configure Environment Variables

```bash
# Create environment file
touch .env

# Add the following variables to the .env file:
# VITE_API_URL=http://localhost:3010/api
# VITE_SOCKET_URL=http://localhost:3010
```

### Start the Web Frontend Development Server

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The web application will be available at http://localhost:5173 by default.

### Build for Production

```bash
# Create a production build
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## Mobile Frontend Setup

### Install Mobile Frontend Dependencies

```bash
# Navigate to the mobile frontend directory
cd ../mobile-frontend

# Install dependencies
npm install
# or
yarn install
```

### Configure API Endpoint

Edit the file at `src/api/axios.js` to point to your backend server:

```javascript
// Update the BASE_URL to match your backend server address
const BASE_URL = 'http://YOUR_LOCAL_IP:3010/api';
```

> Note: When testing on a physical device, use your computer's local network IP address instead of localhost.

### Start the Expo Development Server

```bash
# Start the Expo development server
npm start
# or
yarn start
```

This will open the Expo developer tools in your browser. You can run the app on:
- iOS Simulator
- Android Emulator
- Physical device using the Expo Go app (scan the QR code)

### Build for Production

```bash
# Build for Android
eas build -p android

# Build for iOS
eas build -p ios
```

> Note: You'll need an Expo account and may need to configure additional settings in `eas.json`.

## Verifying the Installation

1. Start the backend server
2. Start the web frontend
3. Start the mobile frontend
4. Access the web application at http://localhost:5173
5. Log in with the default committee credentials:
   - Email: admin@chainocracy.com
   - Password: admin123
6. Create a test election
7. Use the mobile app to register a voter account and participate in the election

## Troubleshooting

### Common Issues

1. **Backend connection errors**:
   - Ensure the backend server is running
   - Check that the port is not blocked by a firewall
   - Verify the API URL in frontend configurations

2. **Database initialization errors**:
   - Ensure the database directory exists and is writable
   - Check the DATABASE_PATH in the .env file

3. **Mobile app cannot connect to backend**:
   - Ensure you're using the correct local IP address
   - Check that both devices are on the same network
   - Verify that the backend server is configured to accept connections from all interfaces

4. **JWT authentication issues**:
   - Verify the JWT_SECRET is set correctly
   - Check that the token expiration time is appropriate

For additional help, refer to the troubleshooting section in the Developer Guide or open an issue on the project repository.
