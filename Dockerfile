# Prod dependencies stage
FROM oven/bun:1.3.8@sha256:371d30538b69303ced927bb5915697ac7e2fa8cb409ee332c66009de64de5aa3 AS prod-deps
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json bun.lock ./

# Install production dependencies
RUN bun install --frozen-lockfile --production

ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM oven/bun:1.3.8@sha256:371d30538b69303ced927bb5915697ac7e2fa8cb409ee332c66009de64de5aa3 AS builder
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
FROM node:24.13.0-alpine@sha256:cd6fb7efa6490f039f3471a189214d5f548c11df1ff9e5b181aa49e22c14383e AS final
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
