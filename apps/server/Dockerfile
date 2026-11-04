FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune server --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @repo/shared build
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=builder /app .
EXPOSE 5000
CMD ["pnpm", "--filter", "server", "start"]
