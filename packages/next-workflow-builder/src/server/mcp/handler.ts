import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { withMcpAuth } from "better-auth/plugins";
import { auth } from "../auth";
import { resolveUser } from "../auth/resolve-user";
import { createMcpServer } from "./server";

async function handleMcpPost(request: Request, userId: string): Promise<Response> {
  const server = createMcpServer(userId);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  return await transport.handleRequest(request);
}

export async function handleMcpRequest(request: Request): Promise<Response> {
  if (request.method === "POST") {
    // When anonymous auth is enabled, allow session-cookie access (e.g. browser-based clients)
    // so that already-authenticated users can use MCP without OAuth.
    if (process.env.NWB_ANONYMOUS_AUTH !== "false") {
      const user = await resolveUser(request);
      if (user) {
        return handleMcpPost(request, user.id);
      }
    }

    // OAuth-based MCP auth (bearer token / full OAuth 2.1 flow).
    // Unauthenticated requests get a 401 with WWW-Authenticate header,
    // which lets MCP clients (e.g. Claude Desktop) discover the OAuth endpoints.
    // Cast auth — the mcp plugin is conditionally added at runtime,
    // so the static type doesn't include getMcpSession.
    return withMcpAuth(auth as any, async (req, session) => {
      return handleMcpPost(req, session.userId!);
    })(request);
  }

  // GET (SSE) and DELETE (session cleanup) not needed for stateless mode
  return new Response("Method not allowed", { status: 405 });
}
