# Deployment

## Vercel

next-workflow-builder is designed to work seamlessly with Vercel deployments.

### 1. Set environment variables

In your Vercel project settings, add:

```env
DATABASE_URL=postgres://user:password@host:5432/workflow
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
INTEGRATION_ENCRYPTION_KEY=your-encryption-key
```

For preview deployments, `BETTER_AUTH_URL` is not required. The package automatically uses the `VERCEL_URL`
environment variable that Vercel sets automatically.

### 2. Configure build command

Make sure plugin discovery runs before the build:

```json
{
  "scripts": {
    "build": "nwb discover-plugins && next build"
  }
}
```

### 3. Run database migrations

For the initial deployment (or after schema changes), run migrations:

```bash
npx nwb migrate-prod
```

You can add this as a Vercel build step or run it manually after your database is provisioned.

### 4. Social auth providers

If using social authentication, configure the OAuth provider's callback URL to point to your deployed domain:

```
https://your-domain.com/api/auth/callback/{provider}
```

## Scheduled workflows (Vercel Cron)

If your workflow uses a **Schedule** trigger, the code export generates a `vercel.json` cron configuration. To set it up:

### 1. Add the cron config

Click the **Trigger** node in the workflow editor, then copy the generated JSON into `vercel.json` at the root of your project:

```json
{
  "crons": [
    {
      "path": "/api/workflow-builder/workflow/<workflowId>/cron",
      "schedule": "0 9 * * *"
    }
  ]
}
```

The `path` and `schedule` are pre-filled based on your workflow ID and cron expression.

### 2. Set the `CRON_SECRET` environment variable

In your Vercel project settings, add a `CRON_SECRET` environment variable. Vercel automatically sends this as a bearer token with each cron invocation, and the endpoint rejects requests without it.

```env
CRON_SECRET=your-random-secret
```

> **Tip:** On Vercel, you can generate this value automatically via the Vercel dashboard under **Settings → Cron Jobs**.

### 3. Deploy

Deploy your project. Vercel will detect the `crons` key in `vercel.json` and register the schedule automatically. You can monitor cron executions in the Vercel dashboard under **Logs**.

---

## Self-hosted

### Requirements

- Node.js 22+
- PostgreSQL 14+
- A process manager (PM2, systemd, Docker, etc.)

### Steps

1. Build the application:

```bash
pnpm install
nwb discover-plugins
next build
```

2. Set environment variables:

```env
DATABASE_URL=postgres://user:password@localhost:5432/workflow
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
INTEGRATION_ENCRYPTION_KEY=your-encryption-key
NODE_ENV=production
```

3. Run migrations:

```bash
npx nwb migrate-prod
```

4. Start the server:

```bash
next start
```

## Docker

Example `Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nwb discover-plugins
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

## Database hosting

The package works with any PostgreSQL provider:

- **Vercel Postgres** / **Neon** - Serverless Postgres, works well with Vercel deployments
- **Supabase** - Managed Postgres with additional features
- **Railway** - Simple managed Postgres
- **Self-hosted** - Any PostgreSQL 14+ instance

Set the connection string in `DATABASE_URL`.
