import { Database } from "lucide-react";
import { ActionType } from "../../client/components/workflow/config/action-grid";

const databaseQueryAction: ActionType = {
  id: "Database Query",
  label: "Database Query",
  description: "Query your database",
  category: "System",
  icon: <Database className="size-12 text-blue-300" strokeWidth={ 1.5 }/>,
  codeGenerator: `export async function databaseQueryStep(input: {
  query: string;
}) {
  "use step";
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { success: false, error: "DATABASE_URL environment variable is not set" };
  }
  
  const postgres = await import("postgres");
  const sql = postgres.default(databaseUrl, { max: 1 });
  
  try {
    const result = await sql.unsafe(input.query);
    await sql.end();
    return { success: true, rows: result, count: result.length };
  } catch (error) {
    await sql.end();
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: \`Database query failed: \${message}\` };
  }
}`,
};

export { databaseQueryAction };
