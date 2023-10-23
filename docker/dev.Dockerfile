FROM node:21.0.0-slim
WORKDIR /usr/src/app
RUN npm i -g pnpm
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml package.json ./
RUN apt-get -y update && apt-get -y install curl
RUN --mount=type=cache,id=pnpm,target=/usr/app/.pnpm-store/v3 pnpm fetch
# add source code
COPY . ./
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile
