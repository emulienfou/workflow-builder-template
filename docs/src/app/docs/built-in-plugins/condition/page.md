# Condition

Branch your workflow based on a boolean expression. When the condition evaluates to `true`, downstream nodes execute. When `false`, they are skipped.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Condition | Template Input | Yes | A JavaScript expression that evaluates to `true` or `false` |

## Condition Expressions

The condition field accepts any valid JavaScript comparison expression. Template references are resolved before evaluation.

### Comparison operators

```
{{Trigger.status}} === 200
{{FetchData.count}} > 0
{{User.role}} !== "admin"
{{Order.total}} >= 100
```

### Logical operators

```
{{Trigger.status}} === 200 && {{Trigger.data.length}} > 0
{{User.role}} === "admin" || {{User.role}} === "editor"
```

### String methods

```
{{Trigger.email}}.includes("@company.com")
{{Trigger.name}}.startsWith("John")
```

## Output

| Field | Type | Description |
| --- | --- | --- |
| `condition` | `boolean` | The evaluated result of the condition expression |

## Workflow Behavior

- **True branch**: All nodes connected downstream of the Condition node execute normally
- **False branch**: All downstream nodes are skipped
- The original condition expression and resolved values are logged for debugging

## Security

Condition expressions are validated before evaluation to prevent code injection. Only comparison operators, logical operators, and a whitelist of safe methods are allowed. Expressions containing function calls, assignments, or other potentially unsafe patterns are rejected.

## Generated Code

When exporting a workflow, the Condition action generates an `if` block:

```ts
if (previousResult.status === 200) {
  // True branch nodes
  const sendEmail = await sendEmailStep({
    emailTo: 'user@example.com',
  });
}
```
