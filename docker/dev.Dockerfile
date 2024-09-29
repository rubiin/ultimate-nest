FROM node:20.17.0-slim
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --shamefully-hoist=true
# add source code
COPY . ./
