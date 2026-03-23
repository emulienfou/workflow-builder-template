# Dashboard

The Dashboard page provides a workflow-centric overview with aggregated execution stats per workflow. It is available at `/dashboard`.

## Features

- **Summary stats** — total workflows, total runs, success count, and error count at a glance
- **Workflow table** — each row shows workflow name, run counts (total, success, error, stopped), latest run status badge with relative time, and action buttons
- **Inline actions** — execute, stop, and delete workflows directly from the dashboard
- **Live updates** — polls every 5 seconds so running workflows update automatically
- **Quick navigation** — click a workflow name to jump to its editor

## Accessing the Dashboard

The dashboard is accessible in two ways:

1. **User menu** — click your avatar in the top-right corner and select **Dashboard**
2. **Direct URL** — navigate to `/dashboard`

## Using the exported component

If you use a custom routing setup instead of the built-in `WorkflowPage` catch-all, you can import `DashboardPage` directly:

```tsx
import { DashboardPage } from "next-workflow-builder/client";

export default function MyDashboardRoute() {
  return <DashboardPage />;
}
```

## Table columns

| Column | Description |
| --- | --- |
| Workflow | Name (links to editor) and description |
| Runs | Total execution count |
| Success | Count of successful executions (green) |
| Error | Count of failed executions (red) |
| Stopped | Count of cancelled executions (gray) |
| Latest Run | Status badge and relative time of most recent execution |
| Actions | Play (execute), Stop (cancel running), Delete |

## Action buttons

| Button | Condition | Description |
| --- | --- | --- |
| Play | No running execution | Starts a new execution of the workflow |
| Stop | Has a running/pending execution | Cancels the currently running execution |
| Delete | Always visible | Deletes the workflow and all its executions (with confirmation) |

## Status badges

| Status | Color | Description |
| --- | --- | --- |
| Success | Green | Workflow completed without errors |
| Error | Red | Workflow failed during execution |
| Running | Blue (animated) | Workflow is currently executing |
| Pending | Yellow | Workflow is queued but not yet started |
| Cancelled | Gray | Workflow was manually stopped |

## API endpoint

The dashboard fetches data from:

```
GET /api/workflows/dashboard
```

Returns all workflows for the authenticated user with aggregated execution stats. Each entry includes:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Workflow ID |
| `name` | `string` | Workflow name |
| `description` | `string \| null` | Workflow description |
| `updatedAt` | `string` | ISO 8601 timestamp |
| `totalRuns` | `number` | Total execution count |
| `successCount` | `number` | Executions with status `"success"` |
| `errorCount` | `number` | Executions with status `"error"` |
| `cancelledCount` | `number` | Executions with status `"cancelled"` |
| `latestRunStatus` | `string \| null` | Status of the most recent execution |
| `latestRunStartedAt` | `string \| null` | ISO 8601 timestamp of the most recent execution |
| `runningExecutionId` | `string \| null` | ID of currently running/pending execution (for stop button) |
