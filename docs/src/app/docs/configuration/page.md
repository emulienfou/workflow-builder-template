# Configuration

## Next.js plugin options

The `nextWorkflowBuilder()` function accepts a `NextWorkflowBuilderConfig` object:

```ts
import nextWorkflowBuilder from "next-workflow-builder";

const withNextWorkflowBuilder = nextWorkflowBuilder({
  debug: false,
  authOptions: {
    socialProviders: {
      vercel: {
        clientId: process.env.VERCEL_CLIENT_ID,
        clientSecret: process.env.VERCEL_CLIENT_SECRET,
      },
    },
  },
});
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `debug` | `boolean` | `false` | Enable debug logging |
| `authOptions` | `Record<string, unknown>` | `undefined` | Better Auth configuration options (must be JSON-serializable) |

The `authOptions` object is serialized and injected as an environment variable at build time, so all values must be
JSON-serializable. This is where you configure authentication providers, email/password settings, and other Better Auth
options.

### Auth options example

```ts
const withNextWorkflowBuilder = nextWorkflowBuilder({
  authOptions: {
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      vercel: {
        clientId: process.env.VERCEL_CLIENT_ID,
        clientSecret: process.env.VERCEL_CLIENT_SECRET,
      },
    },
  },
});
```

## Layout component options

The `Layout` component accepts props from Better Auth UI's `AuthUIProviderProps`:

```tsx
<Layout
  social={{ providers: ["vercel", "github"] }}
>
  {children}
</Layout>
```

When using social auth providers, pass the provider names in the `social.providers` array to display the corresponding
login buttons in the auth dialog.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret key for Better Auth session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL for Better Auth callbacks (e.g., `http://localhost:3000`) |
| `INTEGRATION_ENCRYPTION_KEY` | Yes | Key used to encrypt stored integration credentials at rest |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL (alternative to `BETTER_AUTH_URL`) |
| `VERCEL_URL` | No | Auto-set by Vercel for preview deployments |

Plugin-specific environment variables are defined by each plugin's `formFields[].envVar` configuration.
See [Plugins](/docs/plugins) for details.
