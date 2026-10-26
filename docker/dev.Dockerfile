FROM node:24.22.1-slim
WORKDIR /usr/src/app

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# corepack resolves the version pinned in package.json's packageManager. Prepare it explicitly so
# a bad pin fails here rather than halfway through the install below.
RUN corepack enable && corepack prepare --activate
# The store lives under $HOME/.local/share/pnpm/store, and its major version moves with pnpm, so
# mount that whole directory rather than a version-specific path the cache would never hit.
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm pnpm fetch
# add source code
COPY . ./
# A cache mount is not part of the image, so the install has to mount the same store the fetch
# filled; without it `--offline` reads an empty store and fails on the first package.
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm pnpm install --offline --shamefully-hoist=true --frozen-lockfile
