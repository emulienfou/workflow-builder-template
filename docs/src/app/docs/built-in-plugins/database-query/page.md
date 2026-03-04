# Database Query

Execute SQL queries against a PostgreSQL database. This plugin connects to your database using a configured connection string and returns query results.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| SQL Query | Code Editor (SQL) | Yes | The SQL query to execute. Supports template references |
| Connection | Integration Selector | No | Database integration to use. Falls back to `DATABASE_URL` environment variable |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the query executed successfully |
| `rows` | `unknown[]` | Array of result rows |
| `count` | `number` | Number of rows returned |
| `error` | `string` | Error message if `success` is `false` |

## Usage Examples

### Simple SELECT query

```sql
SELECT * FROM users WHERE active = true ORDER BY created_at DESC LIMIT 100
```

### Query with template references

Use data from a previous node in your query:

```sql
SELECT * FROM orders WHERE user_id = '{{Trigger.userId}}'
```

### INSERT with returning

```sql
INSERT INTO logs (event, data, created_at)
VALUES ('workflow_run', '{{HTTPRequest.data}}', NOW())
RETURNING id
```

## Connection

The Database Query plugin resolves its database connection in this order:

1. **Integration selector** — If a database integration is selected, the plugin fetches the `DATABASE_URL` from the stored (encrypted) credentials
2. **Environment variable** — Falls back to the `DATABASE_URL` environment variable

The connection uses:
- Max 1 connection per query
- 10-second connect timeout
- 20-second idle timeout
- Automatic cleanup after query completion

## Error Handling

Common error scenarios and their messages:

| Error | Cause |
| --- | --- |
| Connection refused | Database server is not running or not accessible |
| Host not found | Invalid hostname in connection string |
| Authentication failed | Wrong username or password |
| Relation does not exist | Table or view not found |
| Syntax error | Invalid SQL syntax |

## Generated Code

When exporting a workflow, the Database Query action generates:

```ts
import { databaseQueryStep } from './steps/database-query-step';

const result = await databaseQueryStep({
  dataSource: { name: "my-database" },
  query: `SELECT * FROM users WHERE active = true`,
});
```
