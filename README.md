# erc3-js

JavaScript ESM client for the ERC3 benchmark evaluation platform.

## Overview

`erc3-js` is a pure ESM (ECMAScript Module) JavaScript client for interacting with the ERC3 benchmark platform. It provides a clean, modern API for managing evaluation sessions, running tasks, and interacting with benchmark-specific APIs.

## Features

- **Pure ESM**: Modern JavaScript modules with full tree-shaking support
- **Multiple Benchmarks**: Support for Store, Demo, and other benchmarks
- **Type-Safe**: Comprehensive JSDoc annotations for editor autocomplete
- **Separate APIs**: Store and Demo APIs are independently accessible
- **Error Handling**: Custom `ApiException` class with detailed error information
- **Session Management**: Complete workflow for sessions and tasks

## Installation

```bash
npm install erc3-js
```

## Quick Start

```javascript
import { ERC3 } from 'erc3-js';

// Create client (uses ERC3_API_KEY env var)
const client = new ERC3();

// Or provide API key explicitly
const client = new ERC3({ apiKey: 'your-api-key' });

// List available benchmarks
const benchmarks = await client.listBenchmarks();
console.log(benchmarks);

// Start a session
const session = await client.startSession({
  benchmark: 'store',
  workspace: 'my-workspace',
  name: 'Test Run 1'
});

// Get session status
const status = await client.sessionStatus(session.session_id);
console.log('Tasks:', status.tasks);

// Work with a task
const task = status.tasks[0];
await client.startTask(task.task_id);

// Get specialized client for the benchmark
const storeClient = client.getStoreClient(task.task_id);
const products = await storeClient.listProducts();
console.log(products);

// Complete the task
const result = await client.completeTask(task.task_id);
console.log('Evaluation:', result.eval);
```

## Command-Line Interface (CLI)

The package includes a powerful CLI tool for interacting with the ERC3 API from the command line.

### Installation

After installing the package globally or locally, the `erc3` command becomes available:

```bash
# Install globally
npm install -g erc3-js

# Or use npx without installing
npx erc3-js <command>
```

### Running from Git Clone

If you've cloned this repository instead of installing via npm, you can run the CLI directly with Node.js:

```bash
# From the repository root directory
ERC3_API_KEY='your-api-key' node bin/erc3.js <command> [options]

# Examples:
ERC3_API_KEY='your-api-key' node bin/erc3.js benchmarks
ERC3_API_KEY='your-api-key' node bin/erc3.js session:start store --workspace my-workspace --name "Test Run"
ERC3_API_KEY='your-api-key' node bin/erc3.js store:products task-123 --limit 3

# Or set the API key as an environment variable first:
export ERC3_API_KEY='your-api-key'
node bin/erc3.js benchmarks
```

Alternatively, you can use `npm link` to create a global symlink:

```bash
# From the repository root
npm link

# Now use it like a globally installed package
erc3 benchmarks
erc3 session:start store --workspace my-workspace --name "Test Run"
```

### Usage

```bash
erc3 <command> [options]
```

Set your API key as an environment variable:
```bash
export ERC3_API_KEY='your-api-key'
```

### CLI Commands

#### Core Commands

```bash
# List benchmarks
erc3 benchmarks

# View benchmark details
erc3 benchmark store

# Start a session
erc3 session:start store --workspace my-workspace --name "Test Run"

# Get session status
erc3 session:status ssn-123

# Search sessions
erc3 session:search --workspace my-workspace

# Start a task
erc3 task:start tsk-456

# View task details
erc3 task:view tsk-456

# Complete a task
erc3 task:complete tsk-456
```

#### Store API Commands

```bash
# List products
erc3 store:products tsk-456 --limit 3

# View basket
erc3 store:basket tsk-456

# Add product to basket
erc3 store:add tsk-456 --sku gpu-h100 --quantity 1

# Remove product from basket
erc3 store:remove tsk-456 --sku gpu-h100 --quantity 1

# Apply coupon
erc3 store:coupon:apply tsk-456 --coupon SAVE20

# Remove coupon
erc3 store:coupon:remove tsk-456

# Checkout
erc3 store:checkout tsk-456
```

#### Demo API Commands

```bash
# Get secret
erc3 demo:secret tsk-789

# Submit answer
erc3 demo:answer tsk-789 --answer "secret-value"
```

### CLI Options

Run `erc3 --help` for complete documentation:

```bash
erc3 --help
```

## API Surface

### Core Client (ERC3)

#### Constructor

```javascript
new ERC3({ apiKey?, baseUrl? })
```

- `apiKey` (string, optional): API key (defaults to `ERC3_API_KEY` env var)
- `baseUrl` (string, optional): Base URL (defaults to `https://erc.timetoact-group.at`)

#### Benchmark Methods

##### `listBenchmarks()`

Lists all available benchmarks.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  https://erc.timetoact-group.at/benchmarks/list
```

**JavaScript:**
```javascript
const benchmarks = await client.listBenchmarks();
// Returns: { benchmarks: [...] }
```

##### `viewBenchmark(benchmark)`

Views detailed information about a specific benchmark.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"benchmark": "store"}' \
  https://erc.timetoact-group.at/benchmarks/view
```

**JavaScript:**
```javascript
const benchmark = await client.viewBenchmark('store');
// Returns: { id: 'store', description: '...', specs: [...], routes: [...] }
```

#### Session Methods

##### `startSession({ benchmark, workspace, name, architecture? })`

Starts a new evaluation session.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account_key": "YOUR_API_KEY",
    "benchmark": "store",
    "workspace": "my-workspace",
    "name": "Test Run 1",
    "architecture": "x86_64"
  }' \
  https://erc.timetoact-group.at/sessions/start
```

**JavaScript:**
```javascript
const session = await client.startSession({
  benchmark: 'store',
  workspace: 'my-workspace',
  name: 'Test Run 1',
  architecture: 'x86_64' // optional, defaults to 'x86_64'
});
// Returns: { session_id: '...', task_count: 15 }
```

##### `sessionStatus(sessionId)`

Gets the current status of a session.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"session_id": "SESSION_ID"}' \
  https://erc.timetoact-group.at/sessions/status
```

**JavaScript:**
```javascript
const status = await client.sessionStatus('session-123');
// Returns: { session_id: '...', tasks: [...], ... }
```

##### `searchSessions(criteria)`

Searches for sessions based on criteria.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account_key": "YOUR_API_KEY",
    "workspace": "my-workspace",
    "benchmark": "store"
  }' \
  https://erc.timetoact-group.at/sessions/search
```

**JavaScript:**
```javascript
const sessions = await client.searchSessions({
  workspace: 'my-workspace',
  benchmark: 'store'
});
```

##### `submitSession(sessionId)`

Submits a completed session for evaluation.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"session_id": "SESSION_ID"}' \
  https://erc.timetoact-group.at/sessions/submit
```

**JavaScript:**
```javascript
const result = await client.submitSession('session-123');
```

#### Task Methods

##### `startTask(taskOrId)`

Starts a task.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"task_id": "TASK_ID"}' \
  https://erc.timetoact-group.at/tasks/start
```

**JavaScript:**
```javascript
await client.startTask('task-123');
// Or with task object:
await client.startTask(task);
```

##### `completeTask(taskOrId)`

Completes a task and retrieves evaluation results.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"task_id": "TASK_ID"}' \
  https://erc.timetoact-group.at/tasks/complete
```

**JavaScript:**
```javascript
const result = await client.completeTask('task-123');
console.log('Evaluation:', result.eval);
```

##### `viewTask(taskId, since?)`

Views task details and logs.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"task_id": "TASK_ID"}' \
  https://erc.timetoact-group.at/tasks/view
```

**JavaScript:**
```javascript
const task = await client.viewTask('task-123');
// Or get logs since timestamp:
const task = await client.viewTask('task-123', 1234567890);
```

##### `logLLM({ taskId, model, usage, durationSec })`

Logs LLM usage for a task.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "task_id": "TASK_ID",
    "model": "gpt-4",
    "usage": {
      "prompt_tokens": 100,
      "completion_tokens": 50,
      "total_tokens": 150
    },
    "duration_sec": 2.5
  }' \
  https://erc.timetoact-group.at/tasks/log
```

**JavaScript:**
```javascript
await client.logLLM({
  taskId: 'task-123',
  model: 'gpt-4',
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150
  },
  durationSec: 2.5
});
```

#### Factory Methods

##### `getStoreClient(taskOrId)`

Creates a Store API client for a specific task.

```javascript
const storeClient = client.getStoreClient('task-123');
// See Store API documentation below
```

##### `getDemoClient(taskOrId)`

Creates a Demo API client for a specific task.

```javascript
const demoClient = client.getDemoClient('task-123');
// See Demo API documentation below
```

### Helper Functions

#### `getApiKey(email, baseUrl?)`

Gets an API key from the ERC3 service.

**cURL Example:**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"email": "your@email.com"}' \
  https://erc.timetoact-group.at/get_key
```

**JavaScript:**
```javascript
import { getApiKey } from 'erc3-js';

const result = await getApiKey('your@email.com');
console.log('API Key:', result.account_key);
```

### Store API

The Store API provides e-commerce functionality for the "store" benchmark. See [Store API Documentation](./src/store/README.md) for detailed information.

**Quick Example:**
```javascript
const storeClient = client.getStoreClient('task-123');

// List products
const products = await storeClient.listProducts({ offset: 0, limit: 20 });

// Add to basket
await storeClient.addToBasket('gpu-h100', 1);

// View basket
const basket = await storeClient.viewBasket();
console.log('Total:', basket.total / 100); // Prices are in cents

// Apply coupon
await storeClient.applyCoupon('DOGGY25');

// Checkout
const result = await storeClient.checkout();
```

See [Store API README](./src/store/README.md) for complete documentation and curl examples.

### Demo API

The Demo API provides a simple secret-retrieval workflow for the "demo" benchmark. See [Demo API Documentation](./src/demo/README.md) for detailed information.

**Quick Example:**
```javascript
const demoClient = client.getDemoClient('task-123');

// Get secret
const secret = await demoClient.getSecret();
console.log('Secret:', secret.value);

// Submit answer
await demoClient.submitAnswer(secret.value);
```

See [Demo API README](./src/demo/README.md) for complete documentation and curl examples.

## Error Handling

The SDK uses a custom `ApiException` class for error handling:

```javascript
import { ERC3, ApiException } from 'erc3-js';

try {
  const result = await client.completeTask('task-123');
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Environment Variables

- `ERC3_API_KEY`: Default API key (optional if provided in constructor)

## Module Exports

The package provides multiple export paths:

```javascript
// Main exports
import { ERC3, StoreClient, DemoClient, ApiException, getApiKey } from 'erc3-js';

// Or import from specific paths
import { StoreClient } from 'erc3-js/store';
import { DemoClient } from 'erc3-js/demo';
import { ApiException } from 'erc3-js/common';
```

## Requirements

- Node.js >= 18.0.0
- ESM-compatible environment

## Examples

See the `examples/` directory for complete working examples:

- `basic-usage.js` - Complete session workflow
- `store-example.js` - Store API usage
- `demo-example.js` - Demo API usage

## License

MIT

## Related Documentation

- [Store API README](./src/store/README.md) - Complete Store API documentation
- [Demo API README](./src/demo/README.md) - Complete Demo API documentation
