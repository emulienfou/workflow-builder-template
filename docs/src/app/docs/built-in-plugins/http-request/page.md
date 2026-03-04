# HTTP Request

Make HTTP requests to any API endpoint. This is the most versatile built-in plugin — use it to call REST APIs, webhooks, or any HTTP service.

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| Method | Select | Yes | HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` |
| URL | Template Input | Yes | The endpoint URL. Supports template references like `{{PreviousNode.url}}` |
| Headers | Template Textarea | No | JSON object of request headers. Defaults to `{}` |
| Body | Template Textarea | No | JSON request body. Disabled for `GET` requests. Defaults to `{}` |

## Output

| Field | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | Whether the request completed successfully |
| `data` | `unknown` | Parsed JSON response body, or raw text if not JSON |
| `status` | `number` | HTTP status code (e.g. `200`, `404`) |
| `error` | `string` | Error message if `success` is `false` |

## Usage Examples

### GET request

Fetch data from an external API:

- **Method**: `GET`
- **URL**: `https://api.example.com/users`
- **Headers**: `{"Authorization": "Bearer token123"}`

### POST request with template data

Send data from a previous node:

- **Method**: `POST`
- **URL**: `https://api.example.com/orders`
- **Headers**: `{"Content-Type": "application/json"}`
- **Body**: `{"email": "{{Trigger.email}}", "plan": "pro"}`

### Chaining requests

Reference output from a previous HTTP Request node:

- **URL**: `https://api.example.com/users/{{FetchUser.data.id}}/profile`

## Error Handling

The step returns `success: false` with a descriptive `error` message for:

- Connection failures (server unreachable, DNS resolution failed)
- Non-2xx HTTP status codes (includes the status code and response body)
- Invalid JSON in headers or body configuration
- Network timeouts

## Generated Code

When exporting a workflow, the HTTP Request action generates:

```ts
import { httpRequestStep } from './steps/http-request-step';

const result = await httpRequestStep({
  url: 'https://api.example.com/endpoint',
  method: 'POST',
  body: {},
});
```
