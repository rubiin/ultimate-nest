## ===========================================================> The common stage
FROM node:26.13.0-slim AS base

RUN corepack enable && corepack prepare pnpm@12.16.1 --activate
ENV PNPM_HOME=/usr/local/bin

## https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl \
 && rm -rf /var/lib/apt/lists/*

## ======================================================> The deps image stage
FROM base AS dependencies

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile

## ======================================================> The build image stage
FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

## ======================================================> The production image stage
FROM base AS deploy

WORKDIR /app
COPY --from=build --chown=node:node /app/dist/ ./dist/
COPY --from=build --chown=node:node /app/node_modules ./node_modules
RUN mkdir -p /app/logs && chown -R node:node /app

USER node

## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
