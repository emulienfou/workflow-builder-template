import { z } from "zod";

export const NextWorkflowBuilderConfigSchema = z.strictObject({
  /** Enable debug logging. */
  debug: z.boolean().optional(),
  /** Set Better Auth options (must be JSON-serializable). */
  authOptions: z.record(z.string(), z.unknown()).optional(),
  /** Enable anonymous authentication so users can try the app before signing in. Defaults to true. */
  anonymousAuth: z.boolean().optional(),
  /** Override the database connection URL. Defaults to process.env.DATABASE_URL. */
  databaseUrl: z.string().optional(),
  /** MCP (Model Context Protocol) server configuration. */
  mcp: z.strictObject({
    /** Enable the MCP server endpoint. */
    enabled: z.boolean(),
    /** Login page path for OAuth consent. Defaults to "/sign-in". */
    loginPage: z.string().optional(),
  }).optional(),
});
