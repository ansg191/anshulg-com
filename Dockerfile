FROM oven/bun:1.2.17@sha256:2cd6a1d9e3d505725243c9564cca08465fc6ffb12c065a09261992e650995ee6 AS base
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
FROM node:24.3.0-alpine@sha256:b8ea75e6dcdf7dbba1ea8b57f77ec89ef04c1719d2ae986c8fbea21f9f4ec187 AS final
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
