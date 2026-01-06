FROM oven/bun:1.3.5@sha256:e90cdbaf9ccdb3d4bd693aa335c3310a6004286a880f62f79b18f9b1312a8ec3 AS base
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
FROM node:24.4.1-alpine@sha256:820e86612c21d0636580206d802a726f2595366e1b867e564cbc652024151e8a AS final
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
