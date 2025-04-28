# Dockerfile for Chainocracy Backend API
# This is an optimized version of the existing Dockerfile

FROM node:21-alpine AS builder

# Set environment variables
ENV NODE_PORT=3000
ENV DIR=/usr/app
ENV SERVER_PORT="3002"

WORKDIR ${DIR}

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install -g npm@latest && \
    npm install -g typescript && \
    npm install rimraf --save && \
    npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:21-alpine

# Set environment variables
ENV NODE_PORT=3000
ENV DIR=/usr/app
ENV SERVER_PORT="3002"

WORKDIR ${DIR}

# Copy only necessary files from builder stage
COPY --from=builder ${DIR}/build ./build
COPY --from=builder ${DIR}/package*.json ./
COPY --from=builder ${DIR}/node_modules ./node_modules

# Expose the application port
EXPOSE ${NODE_PORT}

# Set user to non-root for security
USER node

# Start the application
CMD ["node", "build/network.js", "${SERVER_PORT}"]
