FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
RUN yarn install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY packages/backend ./packages/backend
COPY package.json yarn.lock ./
RUN cd packages/backend && yarn build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/backend/dist ./dist
COPY --from=build /app/packages/backend/migrations ./migrations
COPY packages/backend/package.json ./

EXPOSE 4000

CMD ["sh", "-c", "node dist/src/migrate.js && node dist/seeds/seed.js && node dist/src/index.js"]
