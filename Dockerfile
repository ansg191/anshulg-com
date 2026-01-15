# Prod dependencies stage
FROM oven/bun:1.3.5@sha256:e90cdbaf9ccdb3d4bd693aa335c3310a6004286a880f62f79b18f9b1312a8ec3 AS prod-deps
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json bun.lock ./

# Install production dependencies
RUN bun install --frozen-lockfile --production

ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM oven/bun:1.3.5@sha256:e90cdbaf9ccdb3d4bd693aa335c3310a6004286a880f62f79b18f9b1312a8ec3 AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json bun.lock ./

# Install development dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
ENV NODE_ENV="production"
RUN bun run build

# Final stage
FROM node:24.13.0-alpine@sha256:931d7d57f8c1fd0e2179dbff7cc7da4c9dd100998bc2b32afc85142d8efbc213 AS final
WORKDIR /app

# Ensure signals are handled correctly
RUN apk add --no-cache tini

# Copy built application from builder stage
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

ENV HOST="0.0.0.0"
ENV PORT="4321"
EXPOSE 4321
ENTRYPOINT ["tini", "--", "node", "dist/server/entry.mjs"]
