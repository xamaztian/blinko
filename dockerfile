FROM node:18-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install pnpm -g

RUN pnpm install

COPY . .

RUN pnpm build
CMD ["pnpm", "start"]

# FROM oven/bun:latest
# WORKDIR /app/next-app

# COPY package.json ./
# COPY bun.lockb ./

# RUN bun install

# COPY . .
# RUN bun run build
# CMD bun start