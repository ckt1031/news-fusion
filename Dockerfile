FROM node:20-alpine AS base

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

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
COPY --from=base /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "run", "start"]
