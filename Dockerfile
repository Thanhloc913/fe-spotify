FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable

WORKDIR /react

CMD yarn install && yarn cache clean && yarn dev
# CMD yarn dev
