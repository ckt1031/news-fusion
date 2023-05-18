FROM node:20-alpine AS base

# Setup PNPM
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Create app directory
WORKDIR /app

# Copy package.json, pnpm-lock.yaml and .npmrc
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build app
RUN pnpm build

# Minify static files (HTML, CSS, JS)
RUN pnpx html-minifier-terser --input-dir static --output-dir static --collapse-whitespace --remove-comments --remove-tag-whitespace --minify-js true --minify-css true --use-short-doctype --remove-attribute-quotes

# Final stage
FROM node:20-alpine

# Setup PNPM
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# Create app directory
WORKDIR /app

# Container configuration
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=base /app/dist ./dist
COPY --from=base /app/static ./static
COPY --from=base /app/package.json /app/.npmrc /app/pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 8080

# Start app
CMD ["pnpm", "start"]
