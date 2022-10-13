FROM node:16.18.0-slim
WORKDIR /usr/src/app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i --shamefully-hoist=true 
