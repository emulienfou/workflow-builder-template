# Run Workflows in Sequence

Execute an ordered list of workflows one after another, waiting for each to complete before starting the next. Designed for orchestration use cases like scheduled data pipelines where multiple imports must run in strict order.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Workflows | Ordered list (multi-select) | Yes | Add workflows in the order they should execute. Use the arrow buttons to reorder. |
| On failure | Select | No | `Stop sequence` (default) halts on first failure. `Continue with next workflow` skips failures and proceeds. |
| Input | Template Input | No | Optional JSON passed as trigger input to every workflow in the sequence, e.g. `{"key": "value"}` or `{{PreviousNode.field}}` |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `results` | `array` | Per-workflow results: `{ workflowId, workflowName, executionId, success, output?, error? }` |
| `succeeded` | `number` | Count of workflows that completed successfully |
| `failed` | `number` | Count of workflows that failed |
| `total` | `number` | Total number of workflows in the sequence |

## Usage Examples

### Hourly data pipeline

Replace 8 staggered crons with a single orchestrator:

1. **Hourly Trigger**
2. **Run Workflows in Sequence** — Add all 8 import workflows in order

Single cron entry, single node. Each workflow completes before the next starts.

### Resilient pipeline with continue-on-failure

Run all imports even if one fails, then check the summary:

1. **Hourly Trigger**
2. **Run Workflows in Sequence** — On failure: `Continue with next workflow`
3. **Condition** — `{{RunWorkflowsInSequence.failed}}` > 0
4. **Send Alert** — `{{RunWorkflowsInSequence.failed}} of {{RunWorkflowsInSequence.total}} workflows failed`

## Compound Node

On the canvas, the Run Workflows in Sequence node renders as a compound card showing each child workflow as a numbered row:

- **Before execution** — all children show a pending indicator
- **After execution** — each child shows a green check (success) or red X (error), with a pass/fail summary footer

## How It Works

1. Parses the ordered list of workflow IDs from the node config
2. Iterates sequentially using `for...of` — strictly one workflow at a time
3. Each workflow gets its own execution record (visible individually in the Runs tab)
4. Calls `executeWorkflow()` inline for each, blocking until completion
5. If `continueOnFailure` is false (default), stops the chain on first failure
6. Returns a structured summary with per-workflow results

## Run Workflow vs Run Workflows in Sequence

| | Run Workflow | Run Workflows in Sequence |
| --- | --- | --- |
| **Workflows** | Single | Ordered list |
| **Output** | Sub-workflow's last node output | Array of per-workflow results |
| **Use case** | Dynamic workflow ID, needs sub-workflow output for branching | Static list, orchestration, cron pipelines |
| **Canvas node** | Standard action node | Compound node with child workflow rows |

## Generated Code

When exporting a workflow, the action generates a placeholder:

```ts
export async function runWorkflowsInSequenceStep(input: {
  workflowIds: string[];
  continueOnFailure?: boolean;
  input?: string;
}) {
  "use step";

  // Note: Run Workflows in Sequence is only available in the visual builder.
  // It executes multiple workflows internally in order and returns their outputs.
  throw new Error("Run Workflows in Sequence is not supported in exported code. Use HTTP Request instead.");
}
```

This action relies on the visual builder's database and executor — exported standalone projects should use HTTP Request to call workflow API endpoints instead.
