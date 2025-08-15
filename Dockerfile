FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable

WORKDIR /react

# Install deps on container start (volume-mounted workspace) and run dev
CMD corepack prepare pnpm@9.0.0 --activate && pnpm install && pnpm dev
