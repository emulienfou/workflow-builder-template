# Merge

Combine data from two input arrays using different strategies. Similar to n8n's Merge node, it supports appending, positional merging, and field-based joins.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Mode | Select | Yes | Merge strategy: `Append`, `Combine by Position`, or `Combine by Fields` |
| Input 1 | Template Input | Yes | First array to merge, e.g. `{{DatabaseQuery.rows}}` |
| Input 2 | Template Input | Yes | Second array to merge, e.g. `{{HTTPRequest.data}}` |

### Mode-specific fields

**Combine by Position** adds:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| When arrays have different lengths | Select | Fill with null | `Fill with null` keeps all items, `Discard extra items` only keeps paired items |

**Combine by Fields** adds:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| Match Field (Input 1) | Template Input | `id` | Field name in Input 1 to match on |
| Match Field (Input 2) | Template Input | `id` | Field name in Input 2 to match on |
| Join Type | Select | Inner Join | `Inner`, `Left Outer`, `Right Outer`, or `Full Outer` join |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `merged` | `unknown[]` | The combined result array |
| `totalItems` | `number` | Total number of items in the merged result |

## Merge Modes

### Append

Concatenates both arrays into a single list. Items from Input 1 come first, followed by items from Input 2.

**Input 1:** `[{name: "Alice"}, {name: "Bob"}]`
**Input 2:** `[{name: "Charlie"}]`
**Result:** `[{name: "Alice"}, {name: "Bob"}, {name: "Charlie"}]`

### Combine by Position

Merges items at the same index from both inputs into a single object.

**Input 1:** `[{name: "Alice"}, {name: "Bob"}]`
**Input 2:** `[{age: 30}, {age: 25}]`
**Result:** `[{name: "Alice", age: 30}, {name: "Bob", age: 25}]`

When arrays have different lengths:
- **Fill with null** — Missing items are filled with `null` values
- **Discard extra items** — Only paired items (present in both arrays) are included

### Combine by Fields

SQL-style join that matches items from both inputs based on a shared field value.

**Input 1:** `[{id: 1, name: "Alice"}, {id: 2, name: "Bob"}]`
**Input 2:** `[{id: 1, email: "alice@co.com"}, {id: 3, email: "charlie@co.com"}]`

#### Inner Join (default)
Only items with matching field values in both inputs.

**Result:** `[{id: 1, name: "Alice", email: "alice@co.com"}]`

#### Left Outer Join
All items from Input 1. Matched items from Input 2 are merged in.

**Result:** `[{id: 1, name: "Alice", email: "alice@co.com"}, {id: 2, name: "Bob"}]`

#### Right Outer Join
All items from Input 2. Matched items from Input 1 are merged in.

**Result:** `[{id: 1, name: "Alice", email: "alice@co.com"}, {id: 3, email: "charlie@co.com"}]`

#### Full Outer Join
All items from both inputs. Matched items are merged together.

**Result:** `[{id: 1, name: "Alice", email: "alice@co.com"}, {id: 2, name: "Bob"}, {id: 3, email: "charlie@co.com"}]`

## Usage Examples

### Enrich database records with API data

1. **Database Query** — `SELECT id, name FROM users`
2. **HTTP Request** — Fetch user profiles from external API
3. **Merge** — Mode: `Combine by Fields`, Match Field 1: `id`, Match Field 2: `userId`, Join: `Left Outer`

### Combine results from parallel branches

1. **Branch A** — Database Query returning orders
2. **Branch B** — HTTP Request returning shipments
3. **Merge** — Mode: `Append` to get a unified list

### Pair items by position

1. **Loop** output with processed items
2. **Original** input array
3. **Merge** — Mode: `Combine by Position` to pair original and processed data
