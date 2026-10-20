FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root manifests and workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy package manifests (needed for pnpm install hoisting)
COPY packages/shared/package.json         ./packages/shared/
COPY packages/resume-engine/package.json  ./packages/resume-engine/
COPY packages/job-scraper/package.json    ./packages/job-scraper/
COPY packages/pipeline-tracker/package.json ./packages/pipeline-tracker/
COPY apps/api/package.json                ./apps/api/

# Install all dependencies (prod + dev needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ ./packages/
COPY apps/api/  ./apps/api/

# Build shared packages first, then api
RUN pnpm --filter @pitchfire/shared build
RUN pnpm --filter @pitchfire/resume-engine build
RUN pnpm --filter @pitchfire/job-scraper build
RUN pnpm --filter @pitchfire/pipeline-tracker build
RUN pnpm --filter @pitchfire/api build

# Prune dev deps
FROM node:22-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
