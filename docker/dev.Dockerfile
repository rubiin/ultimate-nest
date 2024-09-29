FROM node:20.17.0-slim
WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm,target=/usr/app/.pnpm-store/v3 pnpm fetch
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile
# add source code
COPY . ./
