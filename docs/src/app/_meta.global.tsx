const meta = {
  index: {
    type: "page",
    display: "hidden",
  },
  devKit: {
    type: "page",
    title: "DevKit",
    href: "https://useworkflow.dev",
  },
  builder: {
    type: "page",
    title: "AI Builder Template",
    href: "https://workflow-builder.dev",
  },
  docs: {
    type: "page",
    title: "Documentation",
    items: {
      index: "Introduction",
      "getting-started": {
        title: "Getting Started",
      },
      configuration: {
        title: "Configuration",
      },
      plugins: {
        title: "Plugins",
      },
      "built-in-plugins": {
        title: "Built-in Plugins",
        items: {
          index: "Overview",
          "http-request": { title: "HTTP Request" },
          condition: { title: "Condition" },
          loop: { title: "Loop" },
          merge: { title: "Merge" },
          "database-query": { title: "Database Query" },
        },
      },
      "creating-plugins": {
        title: "Creating Plugins",
      },
      "api-reference": {
        title: "API Reference",
      },
      "cli-reference": {
        title: "CLI Reference",
      },
      components: {
        title: "Components",
      },
      database: {
        title: "Database",
      },
      authentication: {
        title: "Authentication",
      },
      deployment: {
        title: "Deployment",
      },
      architecture: {
        title: "Architecture",
      },
      contributing: {
        title: "Contributing",
      },
    },
  },
  marketplace: {
    type: "page",
    title: "Marketplace",
  },
};

export default meta;
