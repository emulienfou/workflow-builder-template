# Getting Started

Set up next-workflow-builder in a new or existing Next.js project.

## 1. Install

```bash
npm install next-workflow-builder
# or
pnpm add next-workflow-builder
```

## 2. Configure Next.js

Wrap your Next.js config with the workflow builder plugin:

```ts
// next.config.ts
import type { NextConfig } from "next";
import nextWorkflowBuilder from "next-workflow-builder";

const withNextWorkflowBuilder = nextWorkflowBuilder({
  // NextWorkflowBuilder-specific options (e.g. authOptions, debug)
});

export default withNextWorkflowBuilder({
  // Regular Next.js options
} satisfies NextConfig);
```

The plugin automatically discovers your plugins and sets up virtual module aliases for both Turbopack and webpack.

## 3. Create the API route

Create a catch-all API route that re-exports the built-in HTTP handlers:

```ts
// app/api/[[...slug]]/route.ts
export { GET, POST, PUT, PATCH, DELETE, OPTIONS } from "next-workflow-builder/api";
```

This single file handles all workflow CRUD, execution, auth, and integration endpoints.

## 4. Add the layout

Wrap your app with the `Layout` component and import the required styles:

```tsx
// app/layout.tsx
import { Layout } from "next-workflow-builder/client";
import "next-workflow-builder/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
```

The `Layout` component provides theme support (via `next-themes`), Jotai state management, authentication context, and the persistent workflow canvas.

If you're using social auth providers, pass them via the `social` prop:

```tsx
<Layout social={{ providers: ["vercel"] }}>
  {children}
</Layout>
```

## 5. Add the workflow pages

Use the catch-all `WorkflowPage` component and `generateWorkflowMetadata` for dynamic metadata:

```tsx
// app/[[...slug]]/page.tsx
export { WorkflowPage as default } from "next-workflow-builder/client";
export { generateWorkflowMetadata as generateMetadata } from "next-workflow-builder/server";
```

This single file handles three routes:

| Path | Behavior |
| --- | --- |
| `/` | New workflow homepage with a placeholder canvas |
| `/workflows` | Redirects to the most recently updated workflow |
| `/workflows/[id]` | Opens the workflow editor for a specific workflow |

## 6. Set environment variables

Create a `.env.local` file:

```env
DATABASE_URL=postgres://user:password@localhost:5432/workflow
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
INTEGRATION_ENCRYPTION_KEY=your-encryption-key
```

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret key for Better Auth session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL for auth callbacks |
| `INTEGRATION_ENCRYPTION_KEY` | Yes | Key used to encrypt stored integration credentials |

## 7. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the workflow builder.

## Next steps

- [Configuration](/docs/configuration) - Customize auth providers, debug mode, and more
- [Plugins](/docs/plugins) - Add integrations like Slack, GitHub, Stripe
- [Database](/docs/database) - Set up and migrate your PostgreSQL schema
