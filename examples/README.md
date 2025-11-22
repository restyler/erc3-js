# Examples

This directory contains example scripts demonstrating how to use the erc3-js SDK.

## Prerequisites

Before running the examples, make sure you have:

1. Node.js >= 18.0.0 installed
2. An ERC3 API key

## Setup

1. Set your API key as an environment variable:
   ```bash
   export ERC3_API_KEY='your-api-key-here'
   ```

2. Or create a `.env` file in the project root:
   ```
   ERC3_API_KEY=your-api-key-here
   ```

## Available Examples

### basic-usage.js

Demonstrates the core SDK functionality:
- Creating a client
- Listing and viewing benchmarks
- Starting sessions
- Managing tasks
- Searching sessions

**Run:**
```bash
node examples/basic-usage.js
```

### store-example.js

Complete workflow for the Store API:
- Starting a store session
- Browsing products with pagination
- Managing shopping basket
- Testing coupons
- Checking out
- Completing the task

**Run:**
```bash
node examples/store-example.js
```

### demo-example.js

Simple workflow for the Demo API:
- Starting a demo session
- Retrieving secrets
- Submitting answers
- Using the dispatch method for tool-based workflows

**Run:**
```bash
node examples/demo-example.js
```

## Getting an API Key

If you don't have an API key yet, you can get one by running:

```javascript
import { getApiKey } from 'erc3-js';

const result = await getApiKey('your@email.com');
console.log('API Key:', result.account_key);
```

Or using curl:
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"email": "your@email.com"}' \
  https://erc.timetoact-group.at/get_key
```

## Notes

- These examples use the production ERC3 API at `https://erc.timetoact-group.at`
- Each example creates real sessions and tasks
- Remember to complete or clean up sessions after testing
- Some examples may fail if certain benchmarks are not available

## Error Handling

All examples include proper error handling with the `ApiException` class:

```javascript
try {
  // ... SDK calls ...
} catch (error) {
  if (error instanceof ApiException) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}
```

## Further Reading

- [Main README](../README.md) - Complete SDK documentation
- [Store API README](../src/store/README.md) - Store API details
- [Demo API README](../src/demo/README.md) - Demo API details
