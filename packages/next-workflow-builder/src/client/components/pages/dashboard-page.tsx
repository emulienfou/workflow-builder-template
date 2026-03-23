"use client";

import { Check, Clock, Loader2, Play, Square, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, type DashboardWorkflow } from "../../lib/api-client";
import { cn } from "../../lib/utils";
import { getRelativeTime } from "../../lib/utils/time";
import { Spinner } from "../ui/spinner";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; icon: React.ReactNode; label: string }> = {
    success: {
      class: "bg-green-600/15 text-green-600",
      icon: <Check className="h-3 w-3" />,
      label: "Success",
    },
    error: {
      class: "bg-red-600/15 text-red-600",
      icon: <X className="h-3 w-3" />,
      label: "Error",
    },
    running: {
      class: "bg-blue-600/15 text-blue-600",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: "Running",
    },
    cancelled: {
      class: "bg-gray-600/15 text-gray-500",
      icon: <Square className="h-3 w-3" />,
      label: "Cancelled",
    },
    pending: {
      class: "bg-yellow-600/15 text-yellow-600",
      icon: <Clock className="h-3 w-3" />,
      label: "Pending",
    },
  };

  const c = config[status] || config.pending;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", c.class)}>
      {c.icon}
      {c.label}
    </span>
  );
}

export function DashboardPage() {
  const [workflows, setWorkflows] = useState<DashboardWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadWorkflows = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.workflow.getDashboardWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to load workflows:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => loadWorkflows(false), 5000);
    return () => clearInterval(interval);
  }, [loadWorkflows]);

  const handleExecute = async (workflowId: string) => {
    setActionLoading((prev) => ({ ...prev, [workflowId]: true }));
    try {
      await api.workflow.execute(workflowId);
      await loadWorkflows(false);
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [workflowId]: false }));
    }
  };

  const handleStop = async (executionId: string, workflowId: string) => {
    setActionLoading((prev) => ({ ...prev, [workflowId]: true }));
    try {
      await api.workflow.cancelExecution(executionId);
      await loadWorkflows(false);
    } catch (error) {
      console.error("Failed to cancel execution:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [workflowId]: false }));
    }
  };

  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Delete "${workflowName}"? This will also delete all its executions.`)) return;
    setActionLoading((prev) => ({ ...prev, [workflowId]: true }));
    try {
      await api.workflow.delete(workflowId);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (error) {
      console.error("Failed to delete workflow:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [workflowId]: false }));
    }
  };

  const totalWorkflows = workflows.length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.totalRuns, 0);
  const totalSuccesses = workflows.reduce((sum, w) => sum + w.successCount, 0);
  const totalErrors = workflows.reduce((sum, w) => sum + w.errorCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pointer-events-auto mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Workflows</div>
          <div className="mt-1 text-2xl font-semibold">{totalWorkflows}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Runs</div>
          <div className="mt-1 text-2xl font-semibold">{totalRuns}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Successful</div>
          <div className="mt-1 text-2xl font-semibold text-green-600">{totalSuccesses}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Failed</div>
          <div className="mt-1 text-2xl font-semibold text-red-600">{totalErrors}</div>
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Clock className="mb-3 h-8 w-8 text-muted-foreground" />
          <div className="font-medium text-sm">No workflows yet</div>
          <div className="mt-1 text-muted-foreground text-xs">
            Create a workflow to get started
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Workflow</th>
                <th className="px-4 py-3">Runs</th>
                <th className="px-4 py-3">Success</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Stopped</th>
                <th className="px-4 py-3">Latest Run</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf) => (
                <tr key={wf.id} className="border-b last:border-b-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-sm hover:underline"
                      href={`/workflows/${wf.id}`}
                    >
                      {wf.name}
                    </Link>
                    {wf.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px]">
                        {wf.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums">{wf.totalRuns}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-green-600">{wf.successCount}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-red-600">{wf.errorCount}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-gray-500">{wf.cancelledCount}</td>
                  <td className="px-4 py-3">
                    {wf.latestRunStatus ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge status={wf.latestRunStatus} />
                        <span className="text-xs text-muted-foreground">
                          {wf.latestRunStartedAt && getRelativeTime(wf.latestRunStartedAt)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {wf.runningExecutionId ? (
                        <button
                          type="button"
                          className="rounded p-1.5 text-orange-600 hover:bg-orange-600/10 disabled:opacity-50"
                          title="Stop running execution"
                          disabled={actionLoading[wf.id]}
                          onClick={() => handleStop(wf.runningExecutionId!, wf.id)}
                        >
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded p-1.5 text-green-600 hover:bg-green-600/10 disabled:opacity-50"
                          title="Execute workflow"
                          disabled={actionLoading[wf.id]}
                          onClick={() => handleExecute(wf.id)}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded p-1.5 text-red-600 hover:bg-red-600/10 disabled:opacity-50"
                        title="Delete workflow"
                        disabled={actionLoading[wf.id]}
                        onClick={() => handleDelete(wf.id, wf.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
