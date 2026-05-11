# Build monorepo once; runtime targets: `medusa` (API + admin) dan `storefront` (Next.js).
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate
WORKDIR /server

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
ENV NODE_ENV=production
RUN pnpm --filter @metroapparel/backend build && pnpm --filter @metroapparel/storefront build
RUN cd apps/backend/.medusa/server && pnpm install --prod

FROM base AS medusa
ENV NODE_ENV=production
WORKDIR /server
COPY --from=builder /server ./
COPY docker/production/docker-entrypoint-medusa.sh /server/docker-entrypoint-medusa.sh
RUN chmod +x /server/docker-entrypoint-medusa.sh
EXPOSE 9000
ENTRYPOINT ["/server/docker-entrypoint-medusa.sh"]

FROM base AS storefront
ENV NODE_ENV=production
WORKDIR /server
COPY --from=builder /server ./
WORKDIR /server/apps/storefront
EXPOSE 8000
CMD ["pnpm", "start"]
