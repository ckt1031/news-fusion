FROM node:20-alpine AS base

# Create app directory
WORKDIR /app

# Copy package.json, package-lock.json and .npmrc
COPY package*.json .npmrc ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Final stage
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Container configuration
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=base /app/dist ./dist
COPY --from=base /app/static ./static
COPY --from=base /app/package*.json /app/.npmrc ./

# Install production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "run", "start"]
