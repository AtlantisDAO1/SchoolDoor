# syntax=docker/dockerfile:1

# ---- Base image for installing deps ----
FROM node:20-alpine AS deps
WORKDIR /app
# Install system deps if needed (e.g. sharp)
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build Next.js (output: .next)
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only what is needed at runtime
COPY package.json package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# Expose port
EXPOSE 3000
# Start Next.js server
CMD ["npm", "run", "start"]
