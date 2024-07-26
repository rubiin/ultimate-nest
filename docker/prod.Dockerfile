## ===========================================================> The common stage
FROM node:20.16.0-slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

## https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html
RUN apt-get update && apt-get install -y dumb-init curl

## ======================================================> The deps image stage
FROM base AS dependencies

WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile

## ======================================================> The build image stage
FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod
RUN ( wget -q -O /dev/stdout https://gobinaries.com/tj/node-prune | sh ) \
 && node-prune


## ======================================================> The production image stage
FROM base AS deploy

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules


## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
