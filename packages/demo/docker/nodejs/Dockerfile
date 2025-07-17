FROM node:20-bookworm AS demo-base

FROM demo-base AS base

COPY package.json package-lock.json ./
# Remove yarn files
# COPY yarn.lock .yarnrc.yml ./
# COPY .yarn/releases/yarn-4.4.1.cjs .yarn/releases/yarn-4.4.1.cjs

FROM base AS base-test

USER root

RUN apt-get -y update
RUN apt-get -y install git procps

USER docker

FROM base AS base-prod

USER root
RUN echo "===> installing tools for production" && \
    apt-get update && \
    apt-get install -y --force-yes vim curl openssh-client tini make && \
    apt-get clean  && \
    rm -rf /var/lib/apt/lists/*

USER docker

FROM base AS base-deps

ARG ARTE_GITHUB_NPM_TOKEN

WORKDIR /app

COPY --chown=docker:docker . .

RUN npm install

FROM base-deps AS server-builder

ARG ARTE_GITHUB_NPM_TOKEN

WORKDIR /app

RUN npm run build --workspace=packages/demo-api

FROM base-deps AS admin-builder

ARG ARTE_GITHUB_NPM_TOKEN

WORKDIR /app

RUN npm run build --workspace=packages/demo

FROM base AS prod-deps

ARG ARTE_GITHUB_NPM_TOKEN

WORKDIR /app

COPY --chown=docker:docker . .

RUN npm install --omit=dev

FROM base-prod AS prod

WORKDIR /app

COPY --chown=docker:docker --from=prod-deps /app/node_modules ./src/node_modules
COPY --chown=docker:docker --from=server-builder /app/package.json ./src/package.json
COPY --chown=docker:docker --from=server-builder /app/packages/demo-api/dist ./src
RUN mkdir -p ./admin-build/build
COPY --chown=docker:docker --from=admin-builder /app/packages/demo/dist ./admin-build/

EXPOSE 3301

ENV PORT=3301

CMD ["tini", "--", "node", "src/index.js"]
