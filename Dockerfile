# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development (For local coding with nodemon)
FROM base AS development
RUN npm install
COPY . .
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
# Command is overridden by docker-compose.yml

# Stage 3: Builder (Compiles TypeScript for production)
FROM base AS builder
RUN apk add --no-cache python3 make g++
RUN npm ci
COPY . .
RUN npm run build

# Stage 4: Production (Secure runtime)
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/locales ./locales
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
