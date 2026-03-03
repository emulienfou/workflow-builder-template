# Plugins

This directory contains local plugins for [next-workflow-builder](https://github.com/emulienfou/next-workflow-builder).

Each plugin adds an integration (e.g. Slack, GitHub, Stripe) with its own credentials, actions, step handlers, and optionally custom API routes and UI components.

## Creating a Plugin

Scaffold a new plugin with the CLI:

```bash
npx nwb create-plugin
```

This generates a plugin directory with the required files:

```
plugins/
  my-service/
    index.ts          # Plugin definition + registration
    icon.tsx          # SVG icon component
    credentials.ts    # Credential type definition
    test.ts           # Connection test function
    steps/            # Step handlers (one per action)
```

After creating your plugin, register it in `plugins/index.ts`:

```ts
import "./my-service";
```

Then run discovery to generate registry files:

```bash
npx nwb discover-plugins
```

## Contributing Plugins

When creating plugins for the community:

- Follow the plugin structure documented in the official guide
- Prefer `fetch` over SDK dependencies to reduce supply chain attack surface
- Always import `"server-only"` in step files
- Use `withStepLogging` for execution tracking
- Include a connection test function
- Test with the example app before publishing

## Documentation

For complete guides on plugin development, configuration fields, output display, custom routes, and more:

- [Plugins Overview](https://next-workflow-builder.vercel.app/docs/plugins) — how plugins work, structure, config field types, output templates
- [Creating Plugins](https://next-workflow-builder.vercel.app/docs/creating-plugins) — step-by-step guide to building a plugin from scratch
- [API Reference](https://next-workflow-builder.vercel.app/docs/api-reference) — plugin registry functions and types
- [Contributing](https://next-workflow-builder.vercel.app/docs/contributing) — development setup and submission guidelines
