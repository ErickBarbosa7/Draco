# ---- Stage 1: Build ----
FROM node:20-slim AS build

# Dependencias para instalar Google Chrome (para compilar no hace falta, pero sí para runtime)
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

COPY . .
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-slim AS runtime

# Dependencias de runtime de Puppeteer / Google Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r app && useradd -r -g app -m app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

COPY --from=build /app/dist ./dist

USER app
EXPOSE 4000
CMD [ "node", "dist/index.js" ]
