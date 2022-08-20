## ===========================================================> The common stage
FROM node:16.17.0-alpine AS base
ENV NODE_ENV=production

WORKDIR /app


# Add necessary packages for Sharp to work
RUN apk add --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing \
  vips-dev fftw-dev gcc g++ make libc6-compat
  

COPY package.json \
     yarn.lock    \
     ./
RUN yarn --frozen-lockfile --production \
 && yarn cache clean

## Remove unnecessary files from `node_modules` directory
RUN ( wget -q -O /dev/stdout https://gobinaries.com/tj/node-prune | sh ) \
 && node-prune


## ======================================================> The build image stage
FROM base AS build
ENV NODE_ENV=development

COPY . .
## This step could install only the missing dependencies (ie., development deps ones)
## but there's no way to do that with this NPM version
RUN yarn --frozen-lockfile --ignore-scripts
## Compile the TypeScript source code
RUN yarn build


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
  vips dumb-init


## Running the app wrapped by the init system for helping on graceful shutdowns
CMD ["dumb-init", "node", "dist/main.js"]
