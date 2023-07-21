## ===========================================================> The common stage
FROM node:20.5.0-slim AS base

RUN npm i -g pnpm
## https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html
RUN apt-get update && apt-get install -y dumb-init wget

## ======================================================> The deps image stage
FROM base AS dependencies

WORKDIR /app
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/usr/app/.pnpm-store/v3 pnpm fetch
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

ARG PORT=8000
ENV PORT=$PORT
EXPOSE $PORT


HEALTHCHECK --interval=10m --timeout=5s --retries=3 \
        CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT || exit 1

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules


## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
