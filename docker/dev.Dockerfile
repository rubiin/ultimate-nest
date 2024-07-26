FROM node:20.16.0-slim
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml package.json ./
RUN apt-get -y update && apt-get -y install curl
RUN --mount=type=cache,id=pnpm,target=/usr/app/.pnpm-store/v3 pnpm fetch
# add source code
COPY . ./
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile
