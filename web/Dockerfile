# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# --- Développement : esbuild --watch + tsx watch (rebuild auto) ---
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 8397
CMD ["npm", "run", "dev"]

# --- Production : bundle minifié servi par Express ---
FROM base AS prod
ENV NODE_ENV=production
RUN npm run build
EXPOSE 8397
CMD ["npx", "tsx", "server/index.ts"]
