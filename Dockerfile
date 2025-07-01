FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies) for compilation
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# IMPORTANT: Expose build-time environment variables for Prisma commands
# These ARGs are set in docker-compose.yml's 'build' section
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client and build
# Prisma needs DATABASE_URL during 'prisma generate' to introspect the schema
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from the builder stage
# Only copy necessary files for production
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
# Copy prisma/schema.prisma and migrations for runtime usage by Prisma Client
COPY --from=builder --chown=nodejs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma/migrations ./prisma/migrations

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Health check command for Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Command to run the application
CMD ["node", "dist/server.js"]