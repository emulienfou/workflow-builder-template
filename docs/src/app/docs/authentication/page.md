# Authentication

next-workflow-builder uses [Better Auth](https://www.better-auth.com/) for authentication, with built-in support for
anonymous users, email/password, and social providers.

## Default configuration

Out of the box, the package configures Better Auth with:

- **Anonymous authentication** - Users can start building workflows without signing up (enabled by default, can be disabled)
- **Email and password** - Enabled by default with no email verification required
- **Anonymous account migration** - When an anonymous user signs up, their workflows, integrations, and executions are
  automatically migrated to the new account

## Customizing auth

Auth options are configured in the `nextWorkflowBuilder()` call in your `next.config.ts`:

```ts
// next.config.ts
import nextWorkflowBuilder from "next-workflow-builder";

const withNextWorkflowBuilder = nextWorkflowBuilder({
  authOptions: {
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    },
  },
});

export default withNextWorkflowBuilder({});
```

The `authOptions` object is serialized and injected at build time, so all values must be JSON-serializable.

### Displaying social login buttons

When using social providers, pass the provider names to the `Layout` component in your `app/layout.tsx`:

```tsx
import { Layout } from "next-workflow-builder/client";

<Layout social={{ providers: ["github", "google"] }}>
  {children}
</Layout>
```

### Disabling anonymous authentication

By default, anonymous authentication is enabled so users can try the app without signing up. To require sign-in before using the app:

```ts
const withNextWorkflowBuilder = nextWorkflowBuilder({
  anonymousAuth: false,
  authOptions: {
    socialProviders: {
      vercel: {
        clientId: process.env.VERCEL_CLIENT_ID || "",
        clientSecret: process.env.VERCEL_CLIENT_SECRET || "",
      },
    },
  },
});
```

### Disabling email/password auth

To use only social providers:

```ts
const withNextWorkflowBuilder = nextWorkflowBuilder({
  authOptions: {
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      vercel: {
        clientId: process.env.VERCEL_CLIENT_ID || "",
        clientSecret: process.env.VERCEL_CLIENT_SECRET || "",
      },
    },
  },
});
```

## Base URL resolution

Better Auth needs a base URL for callbacks and redirects. The package resolves it in this order:

1. `BETTER_AUTH_URL` environment variable (recommended for production)
2. `NEXT_PUBLIC_APP_URL` environment variable
3. `VERCEL_URL` environment variable (auto-set by Vercel, adds `https://` prefix)
4. `http://localhost:3000` (fallback for local development)

## Anonymous user migration

When an anonymous user links to a real account (e.g. signs up with email or a social provider), the following data is
automatically migrated:

- **Workflows** - All workflows created by the anonymous user
- **Workflow executions** - Execution history and logs
- **Integrations** - Saved integration credentials

This ensures a seamless experience where users can start building immediately and sign up later without losing their
work.

## Auth API routes

All auth routes are handled by Better Auth via the catch-all route:

```
/api/auth/[...all]
```

This includes sign in, sign up, sign out, session management, and OAuth callbacks.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Secret key for session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `VERCEL_CLIENT_ID` | No | Vercel OAuth client ID |
| `VERCEL_CLIENT_SECRET` | No | Vercel OAuth client secret |
