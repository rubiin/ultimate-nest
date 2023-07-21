FROM node:20.5.0-slim
WORKDIR /usr/src/app
RUN npm i -g pnpm
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/usr/app/.pnpm-store/v3 pnpm fetch
COPY package.json ./
RUN pnpm install --offline --shamefully-hoist=true --frozen-lockfile
