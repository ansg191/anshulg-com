# Prod dependencies stage
FROM oven/bun:1.4.5@sha256:3aa040e5445efa09d75bb428a64ba50db13e2b3ac9b6b0c7f145615f62b2ee18 AS prod-deps
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json bun.lock ./

# Install production dependencies
RUN bun install --frozen-lockfile --production

ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM oven/bun:1.4.5@sha256:3aa040e5445efa09d75bb428a64ba50db13e2b3ac9b6b0c7f145615f62b2ee18 AS builder
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
FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS final
WORKDIR /app

# Ensure signals are handled correctly
RUN apk add --no-cache tini

# Copy built application from builder stage
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

USER node

ENV HOST="0.0.0.0"
ENV PORT="4321"
EXPOSE 4321
ENTRYPOINT ["tini", "--", "node", "dist/server/entry.mjs"]
