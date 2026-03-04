# Loop

Iterate over a list of items, processing them one at a time or in batches. Similar to n8n's SplitInBatches node.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Items to Iterate | Template Input | Yes | Reference to an array from a previous node, e.g. `{{DatabaseQuery.rows}}` |
| Batch Size | Template Input | No | Number of items per batch. Defaults to `1` |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `hasMore` | `boolean` | Whether there are more batches to process |
| `currentBatchIndex` | `number` | Current batch index (0-based) |
| `currentBatch` | `unknown[]` | Items in the current batch |
| `currentItem` | `unknown` | First item of the current batch (convenience field for single-item iteration) |
| `currentIndex` | `number` | Index of the first item of the current batch in the full array |
| `totalItems` | `number` | Total number of items in the array |
| `totalBatches` | `number` | Total number of batches |
| `items` | `unknown[]` | The full original array |
| `batchSize` | `number` | The batch size used |

## Usage Examples

### Process items one at a time

Iterate over database rows and send an email for each:

1. **Database Query** — `SELECT * FROM users WHERE active = true`
2. **Loop** — Items: `{{DatabaseQuery.rows}}`, Batch Size: `1`
3. **Send Email** — To: `{{Loop.currentItem.email}}`

### Process items in batches

Batch API calls to avoid rate limits:

1. **HTTP Request** — Fetch a list of records
2. **Loop** — Items: `{{FetchRecords.data}}`, Batch Size: `10`
3. **HTTP Request** — Process `{{Loop.currentBatch}}` as a batch

## How Iteration Works

The Loop node uses batch-based iteration:

1. The array is split into batches based on `batchSize`
2. Each batch iteration processes the next chunk of items
3. The `hasMore` flag indicates whether more batches remain
4. The workflow executor uses `currentBatchIndex` to track progress

For single-item iteration (batch size = 1), use `{{Loop.currentItem}}` to access the current item directly.

## Generated Code

When exporting a workflow, the Loop action generates:

```ts
export async function loopStep(input: {
  items: unknown[];
  batchSize?: number;
  currentBatchIndex?: number;
}) {
  "use step";

  const items = Array.isArray(input.items) ? input.items : [];
  const batchSize = Math.max(1, input.batchSize || 1);
  const currentBatchIndex = input.currentBatchIndex ?? 0;
  const totalItems = items.length;
  const totalBatches = Math.ceil(totalItems / batchSize);

  const startIndex = currentBatchIndex * batchSize;
  const endIndex = Math.min(startIndex + batchSize, totalItems);
  const currentBatch = items.slice(startIndex, endIndex);

  return {
    hasMore: currentBatchIndex < totalBatches - 1,
    currentBatchIndex,
    currentBatch,
    currentItem: currentBatch[0],
    currentIndex: startIndex,
    totalItems,
    totalBatches,
    items,
    batchSize,
  };
}
```
