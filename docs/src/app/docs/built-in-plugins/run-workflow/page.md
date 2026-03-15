# Run Workflow

Execute another workflow internally and wait for it to complete. The sub-workflow runs inline — no HTTP requests, no auth overhead, no fire-and-forget. The output of the sub-workflow is returned directly for use in downstream nodes.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Workflow | Select (dropdown) | Yes | The workflow to execute. Populated from your saved workflows. |
| Input | Template Input | No | Optional JSON passed as trigger input to the sub-workflow, e.g. `{"key": "value"}` or `{{PreviousNode.field}}` |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `executionId` | `string` | The execution ID of the sub-workflow run |
| `output` | `unknown` | The last node's output from the sub-workflow |

## Usage Examples

### Sequential orchestration

Chain two workflows where the second depends on the first's output:

1. **Run Workflow** — Workflow: `Import Users`, Input: `{}`
2. **Run Workflow** — Workflow: `Send Welcome Emails`, Input: `{{RunWorkflow.output}}`

### Cron-triggered orchestration

Replace 8 staggered cron jobs with a single orchestrator workflow:

1. **Hourly Trigger**
2. **Run Workflow** — `Import Users` (waits for completion)
3. **Run Workflow** — `Import Orders` (starts after previous finishes)
4. **Run Workflow** — `Import Products`

Each sub-workflow runs to completion before the next one starts — guaranteed sequential execution with zero HTTP overhead.

### Pass dynamic input

Use template references to pass data from earlier nodes into the sub-workflow:

1. **Database Query** — `SELECT * FROM config WHERE active = true`
2. **Run Workflow** — Workflow: `Process Config`, Input: `{{DatabaseQuery.rows}}`

## How It Works

1. The step function fetches the target workflow's nodes and edges from the database
2. Creates a new execution record for the sub-workflow (visible in the Runs tab)
3. Calls `executeWorkflow()` inline — the parent workflow blocks until the sub-workflow completes
4. Returns the sub-workflow's last node output as `{{RunWorkflow.output}}`

## Generated Code

When exporting a workflow, the Run Workflow action generates a placeholder:

```ts
export async function runWorkflowStep(input: {
  workflowId: string;
  input?: string;
}) {
  "use step";

  // Note: Run Workflow is only available in the visual builder.
  // It executes another workflow internally and returns its output.
  throw new Error("Run Workflow is not supported in exported code. Use HTTP Request instead.");
}
```

Run Workflow relies on the visual builder's database and executor — exported standalone projects should use HTTP Request to call workflow API endpoints instead.
