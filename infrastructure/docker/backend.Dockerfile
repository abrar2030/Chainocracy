# syntax=docker/dockerfile:1
# Dockerfile for QuantumBallot Backend API
# Build context is the repository root (see docker-compose build.context: ../..).
# The backend compiles the blockchain package alongside itself (its tsconfig
# includes ../blockchain/src), so both packages are installed and copied.

FROM node:20.11.1-alpine3.19 AS builder

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.opencontainers.image.title="QuantumBallot Backend API" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}"

# Build toolchain for native modules (for example bcrypt).
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies for both packages first, for better layer caching.
COPY code/backend/package*.json ./code/backend/
COPY code/blockchain/package*.json ./code/blockchain/
RUN cd code/backend && npm ci --no-audit --no-fund
RUN cd code/blockchain && npm install --no-audit --no-fund

# Copy sources and build (tsc emits code/backend/dist/{backend,blockchain}).
COPY code/ ./code/
RUN cd code/backend && npm run build && npm prune --omit=dev

FROM node:20.11.1-alpine3.19

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.opencontainers.image.title="QuantumBallot Backend API" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}"

RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init ca-certificates tzdata curl && \
    rm -rf /var/cache/apk/* && \
    addgroup -g 1001 -S nodegroup && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G nodegroup nodeuser

ENV NODE_ENV=production \
    SERVER_PORT=3000 \
    NODE_PORT=3000 \
    DIR=/usr/app \
    NODE_OPTIONS="--max-old-space-size=512 --no-warnings" \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

WORKDIR /usr/app

# The backend's node_modules already contains the blockchain's runtime deps
# (crypto-js, level), so the compiled blockchain code under dist/blockchain
# resolves them from here.
COPY --from=builder --chown=nodeuser:nodegroup /app/code/backend/dist ./dist
COPY --from=builder --chown=nodeuser:nodegroup /app/code/backend/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodegroup /app/code/backend/package*.json ./

# Liveness probe hits the /health route the server exposes.
RUN printf '%s\n' \
    "const http = require('http');" \
    "const port = process.env.SERVER_PORT || process.env.NODE_PORT || 3000;" \
    "const req = http.request({ host: 'localhost', port, path: '/health', timeout: 2000, method: 'GET' }, (res) => process.exit(res.statusCode === 200 ? 0 : 1));" \
    "req.on('error', () => process.exit(1));" \
    "req.on('timeout', () => { req.destroy(); process.exit(1); });" \
    "req.end();" \
    > /usr/app/healthcheck.js && chmod 755 /usr/app/healthcheck.js

USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node /usr/app/healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max-old-space-size=512", "--no-warnings", "dist/backend/src/network/network.js"]
