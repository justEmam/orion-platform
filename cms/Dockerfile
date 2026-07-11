FROM node:20-slim

WORKDIR /app

# Payload/sharp need these at build time
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
# Install deps, then force the Linux build of sharp for THIS container's platform
# (the version in package.json may resolve to a host binary otherwise).
RUN npm install \
 && npm install --os=linux --libc=glibc --cpu=x64 sharp@0.34.2

COPY . .
# NEXT_PUBLIC_* vars are baked into the browser bundle at BUILD time, so they
# must be present here — not just at runtime. Passed as build args from compose.
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_CHAT_ENDPOINT
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_CHAT_ENDPOINT=$NEXT_PUBLIC_CHAT_ENDPOINT
RUN npm run build

# Seed + migrate on startup, then launch (see docker-entrypoint.sh).
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
CMD ["./docker-entrypoint.sh"]
