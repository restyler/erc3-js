/**
 * ERC3 JavaScript SDK - Main Client
 *
 * A JavaScript ESM implementation of the ERC3 REST API client.
 * Based on the Python reference implementation.
 *
 * @module erc3-js/client
 */

import { ApiException } from './common.js';
import { StoreClient } from './store/client.js';
import { DemoClient } from './demo/client.js';

/**
 * Main ERC3 API client
 *
 * Manages sessions and tasks for the ERC3 benchmark platform.
 * Use this client to:
 * - List and view benchmarks
 * - Start and manage evaluation sessions
 * - Start and complete tasks
 * - Create specialized API clients (Store, Demo)
 *
 * @example
 * ```javascript
 * import { ERC3 } from 'erc3-js';
 *
 * const client = new ERC3({ apiKey: 'your-api-key' });
 * const benchmarks = await client.listBenchmarks();
 * ```
 */
export class ERC3 {
  /**
   * Creates an ERC3 client instance
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - API key (defaults to ERC3_API_KEY env var)
   * @param {string} options.baseUrl - Base URL (defaults to https://erc.timetoact-group.at)
   *
   * @example
   * ```javascript
   * // Using API key from environment variable
   * const client = new ERC3();
   *
   * // Or specify API key explicitly
   * const client = new ERC3({ apiKey: 'your-api-key' });
   * ```
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ERC3_API_KEY;
    this.baseUrl = options.baseUrl || 'https://erc.timetoact-group.at';

    if (!this.apiKey) {
      throw new Error('API key is required. Set ERC3_API_KEY env var or pass apiKey option.');
    }
  }

  /**
   * Makes a POST request to the API
   * @private
   */
  async _request(endpoint, data = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Check for API errors
      if (result.status && result.status >= 400) {
        throw new ApiException(
          result.error || 'API Error',
          result.status,
          result.code,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        `Request failed: ${error.message}`,
        500,
        'REQUEST_FAILED',
        error.message
      );
    }
  }

  // ============================================================================
  // Core API Methods
  // ============================================================================

  /**
   * Lists available benchmarks
   *
   * @returns {Promise<Object>} Benchmarks list
   *
   * @example
   * ```javascript
   * const result = await client.listBenchmarks();
   * console.log(result.benchmarks);
   * ```
   */
  async listBenchmarks() {
    return this._request('/benchmarks/list', {});
  }

  /**
   * Views detailed information about a benchmark
   *
   * @param {string} benchmark - Benchmark ID
   * @returns {Promise<Object>} Benchmark details
   *
   * @example
   * ```javascript
   * const benchmark = await client.viewBenchmark('store');
   * console.log(benchmark.name, benchmark.description);
   * ```
   */
  async viewBenchmark(benchmark) {
    return this._request('/benchmarks/view', { benchmark });
  }

  /**
   * Starts a new evaluation session
   *
   * @param {Object} options - Session options
   * @param {string} options.benchmark - Benchmark ID
   * @param {string} options.workspace - Workspace name
   * @param {string} options.name - Session name
   * @param {string} options.architecture - Architecture description (default: 'x86_64')
   * @returns {Promise<Object>} Session info with session_id and task_count
   *
   * @example
   * ```javascript
   * const session = await client.startSession({
   *   benchmark: 'store',
   *   workspace: 'my-workspace',
   *   name: 'Test Run 1',
   *   architecture: 'x86_64'
   * });
   * console.log('Session ID:', session.session_id);
   * ```
   */
  async startSession({ benchmark, workspace, name, architecture = 'x86_64' }) {
    return this._request('/sessions/start', {
      account_key: this.apiKey,
      benchmark,
      workspace,
      name,
      architecture,
    });
  }

  /**
   * Gets the status of a session
   *
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session status with tasks array
   *
   * @example
   * ```javascript
   * const status = await client.sessionStatus('session-123');
   * console.log('Tasks:', status.tasks);
   * ```
   */
  async sessionStatus(sessionId) {
    return this._request('/sessions/status', { session_id: sessionId });
  }

  /**
   * Searches for sessions based on criteria
   *
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Object>} Sessions list
   *
   * @example
   * ```javascript
   * const sessions = await client.searchSessions({
   *   workspace: 'my-workspace',
   *   benchmark: 'store'
   * });
   * ```
   */
  async searchSessions(criteria) {
    return this._request('/sessions/search', {
      account_key: this.apiKey,
      ...criteria,
    });
  }

  /**
   * Submits a completed session for evaluation
   *
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Submission result
   *
   * @example
   * ```javascript
   * const result = await client.submitSession('session-123');
   * console.log('Submission result:', result);
   * ```
   */
  async submitSession(sessionId) {
    return this._request('/sessions/submit', { session_id: sessionId });
  }

  /**
   * Starts a task
   *
   * @param {Object|string} taskOrId - Task object or task ID
   * @returns {Promise<Object>} Task start result
   *
   * @example
   * ```javascript
   * // Using task ID
   * await client.startTask('task-123');
   *
   * // Using task object
   * await client.startTask(task);
   * ```
   */
  async startTask(taskOrId) {
    const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.task_id;
    return this._request('/tasks/start', { task_id: taskId });
  }

  /**
   * Completes a task and retrieves evaluation results
   *
   * @param {Object|string} taskOrId - Task object or task ID
   * @returns {Promise<Object>} Task completion result with eval
   *
   * @example
   * ```javascript
   * const result = await client.completeTask('task-123');
   * console.log('Task evaluation:', result.eval);
   * ```
   */
  async completeTask(taskOrId) {
    const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.task_id;
    return this._request('/tasks/complete', { task_id: taskId });
  }

  /**
   * Views task details
   *
   * @param {string} taskId - Task ID
   * @param {number} since - Timestamp to get logs since (optional)
   * @returns {Promise<Object>} Task details
   *
   * @example
   * ```javascript
   * const task = await client.viewTask('task-123');
   * console.log(task);
   * ```
   */
  async viewTask(taskId, since = null) {
    const data = { task_id: taskId };
    if (since !== null) {
      data.since = since;
    }
    return this._request('/tasks/view', data);
  }

  /**
   * Logs LLM usage for a task
   *
   * @param {Object} options - Logging options
   * @param {string} options.taskId - Task ID
   * @param {string} options.model - Model identifier
   * @param {Object} options.usage - Token usage object
   * @param {number} options.durationSec - Duration in seconds
   * @returns {Promise<Object>} Log result
   *
   * @example
   * ```javascript
   * await client.logLLM({
   *   taskId: 'task-123',
   *   model: 'gpt-4',
   *   usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
   *   durationSec: 2.5
   * });
   * ```
   */
  async logLLM({ taskId, model, usage, durationSec }) {
    return this._request('/tasks/log', {
      task_id: taskId,
      model,
      usage: {
        prompt_tokens: usage.prompt_tokens || usage.input_tokens || 0,
        completion_tokens: usage.completion_tokens || usage.output_tokens || 0,
        total_tokens: usage.total_tokens || 0,
      },
      duration_sec: durationSec,
    });
  }

  /**
   * Creates a Store API client for a specific task
   *
   * @param {Object|string} taskOrId - Task object or task ID
   * @returns {StoreClient} Store API client
   *
   * @example
   * ```javascript
   * const storeClient = client.getStoreClient('task-123');
   * const products = await storeClient.listProducts();
   * ```
   */
  getStoreClient(taskOrId) {
    const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.task_id;
    return new StoreClient(this.baseUrl, taskId);
  }

  /**
   * Creates a Demo API client for a specific task
   *
   * @param {Object|string} taskOrId - Task object or task ID
   * @returns {DemoClient} Demo API client
   *
   * @example
   * ```javascript
   * const demoClient = client.getDemoClient('task-123');
   * const secret = await demoClient.getSecret();
   * ```
   */
  getDemoClient(taskOrId) {
    const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.task_id;
    return new DemoClient(this.baseUrl, taskId);
  }
}

/**
 * Helper function to get API key from the ERC3 service
 *
 * @param {string} email - Email to get API key for
 * @param {string} baseUrl - Base URL (optional)
 * @returns {Promise<Object>} API key response
 *
 * @example
 * ```javascript
 * import { getApiKey } from 'erc3-js';
 *
 * const result = await getApiKey('your@email.com');
 * console.log('API Key:', result.account_key);
 * ```
 */
export async function getApiKey(email, baseUrl = 'https://erc.timetoact-group.at') {
  const response = await fetch(`${baseUrl}/get_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return response.json();
}
