# Dockerfile for Chainocracy Web Frontend
# This builds a static output and serves it using Nginx.

# Build stage
FROM node:21-alpine AS builder

WORKDIR /app

# Copy package files
COPY web-frontend/package*.json ./

# Install dependencies
RUN npm install -g npm@latest && \
    npm ci

# Copy source code
COPY web-frontend/ .

# Set build-time environment variables (can be overridden)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the static assets
RUN npm run build

# Production stage (Nginx)
FROM nginx:1.25-alpine

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
