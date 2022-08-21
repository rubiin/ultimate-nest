## ===========================================================> The common stage
FROM node:16.17.0-alpine AS base
ENV NODE_ENV=production

WORKDIR /app


# Add necessary packages for Sharp to work
COPY package*.json ./
RUN npm install --arch=x64 --platform=linux --libc=glibc sharp
RUN npm ci --omit=dev


## Remove unnecessary files from `node_modules` directory
RUN ( wget -q -O /dev/stdout https://gobinaries.com/tj/node-prune | sh ) \
 && node-prune


## ======================================================> The build image stage
FROM base AS build
ENV NODE_ENV=development

COPY . .
## This step could install only the missing dependencies (ie., development deps ones)
## but there's no way to do that with this NPM version
RUN npm ci
## Compile the TypeScript source code
RUN npm run build

## =================================================> The production image stage
FROM node:16.17.0-alpine AS prod
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
RUN apk add --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing \
 dumb-init


## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
