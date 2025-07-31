# Build Stage
FROM node:20-bullseye AS builder

ARG USE_MIRROR=false

WORKDIR /app

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"
ENV npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"
ENV PRISMA_ENGINES_MIRROR="https://registry.npmmirror.com/-/binary/prisma"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY . .

RUN if [ "$USE_MIRROR" = "true" ]; then \
      npm config set registry https://registry.npmmirror.com; \
    fi

RUN --mount=type=cache,target=/root/.npm \
  /bin/sh -c '\
    ARCH=$(uname -m); \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
      echo "Instalando SHARP ARM64..."; \
      mkdir -p /tmp/sharp-cache; \
      export SHARP_CACHE_DIRECTORY=/tmp/sharp-cache; \
      npm install --platform=linux --arch=arm64 sharp@0.34.1 --no-save --unsafe-perm || \
      npm install --force @img/sharp-linux-arm64 --no-save; \
    fi; \
    npm install --legacy-peer-deps --unsafe-perm; \
    npx prisma generate; \
    npm --workspace server run build:web; \
    npm --workspace app run build:web; \
    npm run build:seed; \
    printf "#!/bin/sh\necho \"Current Environment: \$NODE_ENV\"\nnpx prisma migrate deploy\nnode server/seed.js\nnode server/index.js\n" > start.sh; \
    chmod +x start.sh;'

# Runtime Stage
FROM node:20-bullseye AS runner

ARG USE_MIRROR=false

WORKDIR /app

ENV NODE_ENV=production
ENV DISABLE_SECURE_COOKIE=false
ENV TRUST_PROXY=1
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"
ENV npm_config_sharp_libvips_binary_host="https://npmmirror.com/mirrors/sharp-libvips"

COPY --from=builder /app/dist ./server
COPY --from=builder /app/server/lute.min.js ./server/lute.min.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /app/start.sh ./

RUN --mount=type=cache,target=/root/.npm \
  apt-get update && apt-get install -y \
    openssl libvips-dev python3 make g++ gcc build-essential && \
  if [ "$USE_MIRROR" = "true" ]; then \
    npm config set registry https://registry.npmmirror.com; \
  fi && \
  chmod +x ./start.sh && \
  echo "Instalando dependencias adicionales..." && \
  ARCH=$(uname -m) && \
  npm install @node-rs/crc32 lightningcss sharp@0.34.1 prisma@5.21.1 && \
  npm install -g prisma@5.21.1 && \
  npm install sqlite3@5.1.7 && \
  npm install llamaindex @langchain/community@0.3.40 && \
  if [ "$ARCH" = "armv7l" ]; then \
    echo "libsql no disponible en $ARCH, omitiendo instalación..."; \
  else \
    npm install @libsql/client @libsql/core libsql || true; \
  fi && \
  npx prisma generate && \
  rm -rf /tmp/* && \
  apt-get purge -y python3 make g++ gcc build-essential && \
  rm -rf /var/lib/apt/lists/* /root/.npm /root/.cache

EXPOSE 1111

CMD ["./start.sh"]
