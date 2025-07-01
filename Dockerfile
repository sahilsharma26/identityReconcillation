FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Copy prisma directory (including schema.prisma and migrations if they exist locally)
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for TypeScript compilation)
# `npm ci` is used for clean installs in CI/CD environments
RUN npm ci && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client (needed for compilation, uses schema.prisma)
# DATABASE_URL is not strictly needed here for 'generate' if schema is stable,
# but it will be available from docker-compose.yml's build args if uncommented there.
RUN npx prisma generate

# Build the TypeScript application
RUN npm run build

# --- Production Stage ---
# Use a smaller base image for the final production container
FROM node:18-alpine AS production

WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only the necessary files from the builder stage for production runtime
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
# Copy the entire prisma directory, which should contain schema.prisma and migrations
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to the non-root user
USER nodejs

# Expose the port your Express app runs on (from .env)
EXPOSE ${PORT}

# Health check for orchestrated environments (like Docker Compose or Kubernetes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Command to run the application when the container starts
CMD ["node", "dist/server.js"]