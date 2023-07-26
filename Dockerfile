FROM node:lts-alpine AS base

# Create app directory
WORKDIR /app

# Setup PNPM
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml and .npmrc
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build app
RUN pnpm build

# Final stage
FROM node:lts-alpine

# Setup PNPM
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Container configuration
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json /app/.npmrc /app/pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Expose port
EXPOSE 8080

# Start app
CMD ["pnpm", "start"]
