FROM oven/bun:1.2.16@sha256:ffd754d1d771513d7b21fb013b60bfc1e22e862d310e9727726d25d1827b6a06 AS base
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json bun.lock ./

FROM base AS prod-deps

# Install production dependencies
RUN bun install --frozen-lockfile --production

FROM base AS build-deps

# Install development dependencies
RUN bun install --frozen-lockfile

FROM build-deps AS builder

# Copy the rest of the application code
COPY . .

# Build the application
ENV NODE_ENV="production"
RUN bun run build

# Final stage
FROM node:24.2.0-alpine@sha256:7aaba6b13a55a1d78411a1162c1994428ed039c6bbef7b1d9859c25ada1d7cc5 AS final
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
