import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../auth";
import { rebuildRequest } from "./utils";

// ============================================================================
// Auth Route Handler (passthrough to better-auth)
// ============================================================================

const { GET: authGet, POST: authPost } = toNextJsHandler(auth);

export async function handleAuth(request: Request, pathSegments: string[]): Promise<Response> {
  // Reconstruct the auth path: /api/auth/[...all]
  // The auth handler expects the path to start with /api/auth/
  const authPath = "/api/auth/" + pathSegments.slice(1).join("/");
  const url = new URL(request.url);
  const newUrl = `${ url.origin }${ authPath }${ url.search }`;
  const newRequest = rebuildRequest(request, newUrl);

  const response = request.method === "GET"
    ? await authGet(newRequest)
    : await authPost(newRequest);

  if (response.status >= 500) {
    const body = await response.clone().text();
    // Temporarily surface the error in the response for debugging
    if (!body) {
      return new Response(JSON.stringify({ debug: "500 with empty body from better-auth", path: authPath }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return response;
}
