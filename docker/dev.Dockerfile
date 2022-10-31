FROM node:18.12.0-slim
WORKDIR /usr/src/app
RUN npm i -g pnpm
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
RUN pnpm install --shamefully-hoist=true --frozen-lockfile
