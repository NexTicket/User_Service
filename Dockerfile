# Multi-stage build for User Service
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for tsx)
RUN npm ci

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies + tsx for runtime
COPY package*.json ./
RUN npm ci --only=production && \
    npm install tsx

# Copy source files (User Service runs with tsx, not compiled)
COPY src ./src

# Copy tsconfig
COPY tsconfig.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4001

# Start the application with tsx (since it uses .mts files)
CMD ["npx", "tsx", "src/index.mts"]
