## ===========================================================> The common stage
FROM node:16.17.0-slim AS base
ENV NODE_ENV=production

WORKDIR /app

RUN npm i -g pnpm

# Add necessary packages for Sharp to work
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --shamefully-hoist=true



## Remove unnecessary files from `node_modules` directory
RUN ( wget -q -O /dev/stdout https://gobinaries.com/tj/node-prune | sh ) \
 && node-prune


## ======================================================> The build image stage
FROM base AS build
ENV NODE_ENV=development

COPY . .
## This step could install only the missing dependencies (ie., development deps ones)
## but there's no way to do that with this NPM version
COPY --from=base /app/node_modules ./node_modules
## Compile the TypeScript source code
RUN pnpm build
RUN pnpm prune --prod

## =================================================> The production image stage
FROM node:16.17.0-slim AS prod
ENV NODE_ENV=production

ARG PORT=8000
ENV PORT=$PORT
EXPOSE $PORT
ENV DEBIAN_FRONTEND=noninteractive

HEALTHCHECK --interval=10m --timeout=5s --retries=3 \
        CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT || exit 1

WORKDIR /app
## Copy required file to run the production application
COPY --from=base --chown=node:node /app/node_modules ./node_modules
COPY --from=base --chown=node:node /app/*.json ./
COPY --from=build --chown=node:node /app/dist ./dist/

## https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html
RUN apt-get install dumb-init

## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
