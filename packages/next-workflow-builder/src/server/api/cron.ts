import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../db";
import { workflowExecutions, workflows } from "../db/schema";
import { executeWorkflowBackground, type WorkflowEdgeLike, type WorkflowNodeLike } from "./utils";

export async function handleCronWorkflow(request: Request, workflowId: string): Promise<Response> {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workflow
    const workflow = await db.query.workflows.findFirst({
      where: eq(workflows.id, workflowId),
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Create execution record
    const [execution] = await db
      .insert(workflowExecutions)
      .values({
        workflowId,
        userId: workflow.userId,
        status: "running",
        input: {},
      })
      .returning();

    // Await execution — Vercel terminates serverless functions once the response
    // is sent, so fire-and-forget would kill the workflow mid-execution.
    // Consumers should set `maxDuration` on their catch-all API route to allow
    // enough time for the workflow to complete.
    await executeWorkflowBackground(
      execution.id,
      workflowId,
      workflow.nodes as WorkflowNodeLike[],
      workflow.edges as WorkflowEdgeLike[],
      {},
    );

    return NextResponse.json({
      success: true,
      workflowId,
      executionId: execution.id,
      message: "Workflow execution completed",
    });
  } catch (error) {
    console.error("[Cron] Scheduled workflow execution error:", error);
    return NextResponse.json(
      {
        error: "Execution failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
