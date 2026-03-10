import { oAuthDiscoveryMetadata, oAuthProtectedResourceMetadata } from "better-auth/plugins";
import { auth } from "../auth";

/**
 * Route handler for /.well-known/oauth-authorization-server
 *
 * MCP clients (e.g. Claude Desktop) fetch OAuth authorization server metadata
 * at the root /.well-known/oauth-authorization-server per RFC 8414.
 *
 * Usage: re-export from app/.well-known/oauth-authorization-server/route.ts
 *
 * @example
 * ```ts
 * export { oAuthDiscoveryHandler as GET } from "next-workflow-builder/api";
 * ```
 */
export const oAuthDiscoveryHandler = oAuthDiscoveryMetadata(auth as any);

/**
 * Route handler for /.well-known/oauth-protected-resource
 *
 * MCP clients fetch protected resource metadata at the root
 * /.well-known/oauth-protected-resource to discover the authorization server.
 *
 * Usage: re-export from app/.well-known/oauth-protected-resource/route.ts
 *
 * @example
 * ```ts
 * export { oAuthResourceHandler as GET } from "next-workflow-builder/api";
 * ```
 */
export const oAuthResourceHandler = oAuthProtectedResourceMetadata(auth as any);
