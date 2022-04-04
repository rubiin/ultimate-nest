FROM node:12.22.7-alpine3.12

WORKDIR /usr/src/app
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV NODE_ENV production
RUN apk update && apk add chromium && rm -rf /var/cache/apk/*
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production=true