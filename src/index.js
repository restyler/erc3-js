/**
 * ERC3 JavaScript SDK
 *
 * A JavaScript ESM implementation of the ERC3 REST API client.
 * Based on the Python reference implementation.
 *
 * @module erc3-js
 */

// Core client
export { ERC3, getApiKey } from './client.js';

// Common utilities
export { ApiException } from './common.js';

// Store API
export { StoreClient } from './store/index.js';

// Demo API
export { DemoClient } from './demo/index.js';

// Default export
export { ERC3 as default } from './client.js';
