# Condition

Branch your workflow based on a structured condition. When the condition evaluates to `true`, downstream nodes execute. When `false`, they are skipped.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| leftValue | Template Input | Yes | The value to test (supports template references) |
| dataType | Select | Yes | Data type for comparison: String, Number, Boolean, or Date & Time |
| operator | Select | Yes | Comparison operator (options change per data type) |
| rightValue | Template Input | For binary operators | The value to compare against (hidden for unary operators) |

## Operators

### String

| Operator | Description |
| --- | --- |
| exists | Value is not null or undefined |
| does not exist | Value is null or undefined |
| is empty | Value is null, undefined, or empty string |
| is not empty | Value is not null, undefined, or empty string |
| equals | Exact string match |
| does not equal | Strings are different |
| contains | Left value includes right value |
| does not contain | Left value does not include right value |
| starts with | Left value starts with right value |
| does not start with | Left value does not start with right value |
| ends with | Left value ends with right value |
| does not end with | Left value does not end with right value |
| matches regex | Left value matches the regular expression |
| does not match regex | Left value does not match the regular expression |

### Number

| Operator | Description |
| --- | --- |
| equals | Numbers are equal |
| does not equal | Numbers are different |
| greater than | Left > right |
| less than | Left < right |
| greater than or equal | Left >= right |
| less than or equal | Left <= right |

### Boolean

| Operator | Description |
| --- | --- |
| is true | Value is truthy |
| is false | Value is falsy |
| exists | Value is not null or undefined |
| does not exist | Value is null or undefined |

### Date & Time

| Operator | Description |
| --- | --- |
| is before | Left date is before right date |
| is after | Left date is after right date |
| equals | Dates are equal |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `condition` | `boolean` | The evaluated result of the condition |

## Workflow Behavior

- **True branch**: All nodes connected downstream of the Condition node execute normally
- **False branch**: All downstream nodes are skipped
- The data type, operator, and resolved values are logged for debugging
