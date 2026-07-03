# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies (uses package-lock.json for reproducible installs)
COPY package.json package-lock.json* ./
RUN npm ci

# Build the app (Nitro auto-detects the node-server preset -> .output/)
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Nitro's node-server listens on PORT (default 3000).
ENV PORT=3000

# Only the built server output is needed at runtime.
COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
