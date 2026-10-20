FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Playwright needs system deps for Chromium
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY packages/shared/package.json         ./packages/shared/
COPY packages/resume-engine/package.json  ./packages/resume-engine/
COPY packages/job-scraper/package.json    ./packages/job-scraper/
COPY packages/pipeline-tracker/package.json ./packages/pipeline-tracker/
COPY apps/agent/package.json              ./apps/agent/

RUN pnpm install --frozen-lockfile

# Install Playwright browsers
RUN npx playwright install chromium

COPY packages/ ./packages/
COPY apps/agent/ ./apps/agent/

RUN pnpm --filter @pitchfire/shared build
RUN pnpm --filter @pitchfire/resume-engine build
RUN pnpm --filter @pitchfire/job-scraper build
RUN pnpm --filter @pitchfire/pipeline-tracker build
RUN pnpm --filter @pitchfire/agent build

FROM node:22-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apt-get update && apt-get install -y \
    libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/agent/dist ./apps/agent/dist
COPY --from=base /app/apps/agent/package.json ./apps/agent/package.json
# Copy Playwright browser cache
COPY --from=base /root/.cache/ms-playwright /root/.cache/ms-playwright

ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

CMD ["node", "apps/agent/dist/worker.js"]
