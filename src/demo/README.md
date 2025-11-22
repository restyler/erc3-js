# Demo API

The Demo API provides a simple secret-retrieval and answer-submission workflow for the ERC3 "demo" benchmark. It's designed for testing and demonstrating the ERC3 platform.

## Overview

The Demo API is a separate API from the main ERC3 client, designed specifically for the "demo" benchmark. It provides a minimal workflow:

1. Retrieve a secret value
2. Submit the secret as an answer

This is useful for testing the platform and understanding the basic task workflow.

## Getting Started

```javascript
import { ERC3 } from 'erc3-js';

const client = new ERC3({ apiKey: 'your-api-key' });

// Start a demo session
const session = await client.startSession({
  benchmark: 'demo',
  workspace: 'my-workspace',
  name: 'Demo Test'
});

// Get a task
const status = await client.sessionStatus(session.session_id);
const task = status.tasks[0];

// Start the task
await client.startTask(task);

// Get the Demo API client
const demo = client.getDemoClient(task);

// Get the secret
const secret = await demo.getSecret();
console.log('Secret:', secret.value);

// Submit the answer
await demo.submitAnswer(secret.value);

// Complete the task
const result = await client.completeTask(task);
console.log('Evaluation:', result.eval);
```

## API Reference

Base URL: `https://erc.timetoact-group.at/demo/{TASK_ID}`

### `getSecret()`

Retrieves the secret value for the current demo task.

**Returns:**
- `value` (string): The secret value

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"tool": "/secret"}' \
  https://erc.timetoact-group.at/demo/TASK_ID/secret
```

**JavaScript Example:**
```javascript
const result = await demo.getSecret();
console.log('Secret:', result.value);
```

**Sample Response:**
```json
{
  "value": "secret-12345"
}
```

### `submitAnswer(answer)`

Submits an answer for the demo task.

**Parameters:**
- `answer` (string): The answer to submit

**Returns:**
- Empty object `{}` on success

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "tool": "/answer",
    "answer": "secret-12345"
  }' \
  https://erc.timetoact-group.at/demo/TASK_ID/answer
```

**JavaScript Example:**
```javascript
await demo.submitAnswer('secret-12345');
```

**Sample Response:**
```json
{}
```

### Tool Dispatch (for LLM agents)

#### `dispatch(request)`

Dispatches a request to the appropriate method based on the `tool` field. This is useful for LLM agents that work with tool-based APIs.

**Parameters:**
- `request` (object): Request object with `tool` field and method-specific parameters

**JavaScript Example:**
```javascript
// Get secret
const secret = await demo.dispatch({ tool: '/secret' });
console.log('Secret:', secret.value);

// Submit answer
await demo.dispatch({
  tool: '/answer',
  answer: secret.value
});
```

## Complete Workflow Example

```javascript
import { ERC3 } from 'erc3-js';

async function runDemoTask() {
  const client = new ERC3({ apiKey: 'your-api-key' });

  // Start session
  const session = await client.startSession({
    benchmark: 'demo',
    workspace: 'test',
    name: 'Demo Test Run'
  });

  console.log('Session started:', session.session_id);

  // Get session status
  const status = await client.sessionStatus(session.session_id);
  console.log('Tasks:', status.tasks.length);

  // Process first task
  const task = status.tasks[0];
  console.log('Task ID:', task.task_id);

  // Start task
  await client.startTask(task);

  // Get demo client
  const demo = client.getDemoClient(task);

  // Get secret
  const secret = await demo.getSecret();
  console.log('Retrieved secret:', secret.value);

  // Submit answer
  await demo.submitAnswer(secret.value);
  console.log('Answer submitted');

  // Complete task
  const result = await client.completeTask(task);
  console.log('Task evaluation:', result.eval);
  console.log('Success:', result.eval.success);

  return result;
}

runDemoTask()
  .then(() => console.log('Demo completed!'))
  .catch(error => console.error('Error:', error));
```

## Using with LLM Agents

The Demo API is designed to work seamlessly with LLM-based agents using the `dispatch` method:

```javascript
import { ERC3 } from 'erc3-js';

async function runAgentDemo(client, taskId) {
  const demo = client.getDemoClient(taskId);

  // Agent workflow using dispatch
  const tools = [
    { tool: '/secret' },
    // ... agent decides next step based on secret
  ];

  for (const toolCall of tools) {
    const result = await demo.dispatch(toolCall);
    console.log('Tool result:', result);

    // Agent processes result and determines next action
    if (toolCall.tool === '/secret') {
      // Submit the secret as answer
      await demo.dispatch({
        tool: '/answer',
        answer: result.value
      });
      break;
    }
  }
}
```

## Error Handling

```javascript
import { ApiException } from 'erc3-js';

try {
  const secret = await demo.getSecret();
  await demo.submitAnswer(secret.value);
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Important Notes

1. **Task-Specific**: Each task has its own unique secret value.

2. **Simple Workflow**: The demo benchmark has a very simple workflow - just get the secret and submit it.

3. **Type Conversion**: The `submitAnswer` method automatically converts the answer to a string.

4. **Tool Format**: When using the raw API (curl), requests must include a `tool` field. The SDK handles this automatically.

## Comparison with Direct API Calls

### Using the SDK:
```javascript
const secret = await demo.getSecret();
await demo.submitAnswer(secret.value);
```

### Using cURL directly:
```bash
# Get secret
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"tool": "/secret"}' \
  https://erc.timetoact-group.at/demo/TASK_ID/secret

# Submit answer
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"tool": "/answer", "answer": "secret-12345"}' \
  https://erc.timetoact-group.at/demo/TASK_ID/answer
```

The SDK handles:
- Adding the `tool` field automatically
- Type conversion for answers
- Error handling with custom exceptions
- Consistent API interface

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/demo/{TASK_ID}/secret` | Retrieve secret value |
| POST | `/demo/{TASK_ID}/answer` | Submit answer |

## Related Documentation

- [Main README](../../README.md) - Complete SDK documentation
- [Store API README](../store/README.md) - Store API documentation
