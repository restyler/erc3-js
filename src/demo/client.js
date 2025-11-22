/**
 * ERC3 Demo API Client
 *
 * Handles demo-specific endpoints for secrets and answers.
 * This is a separate API for the "demo" benchmark that provides a simple
 * secret-retrieval and answer-submission workflow.
 *
 * @module erc3-js/demo
 */

import { ApiException } from '../common.js';

/**
 * Demo API Client
 *
 * Provides methods for interacting with the ERC3 Demo benchmark API.
 * The Demo API is a simple benchmark for testing and demonstration purposes.
 *
 * Features:
 * - Secret retrieval
 * - Answer submission
 *
 * @example
 * ```javascript
 * import { ERC3 } from 'erc3-js';
 *
 * const client = new ERC3({ apiKey: 'your-api-key' });
 * const demoClient = client.getDemoClient('task-123');
 *
 * // Get secret
 * const secret = await demoClient.getSecret();
 * console.log('Secret:', secret.value);
 *
 * // Submit answer
 * await demoClient.submitAnswer(secret.value);
 * ```
 */
export class DemoClient {
  /**
   * Creates a Demo API client instance
   *
   * @param {string} baseUrl - Base URL for the API
   * @param {string} taskId - Task ID for this demo session
   */
  constructor(baseUrl, taskId) {
    this.baseUrl = baseUrl;
    this.taskId = taskId;
  }

  /**
   * Makes a POST request to the demo API
   * @private
   */
  async _request(endpoint, data = {}) {
    const url = `${this.baseUrl}/demo/${this.taskId}${endpoint}`;

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
  // Demo API Methods
  // ============================================================================

  /**
   * Gets the secret for the demo task
   *
   * Retrieves the secret value that needs to be submitted as an answer.
   *
   * @returns {Promise<Object>} Secret object with value
   *
   * @example
   * ```javascript
   * const result = await demoClient.getSecret();
   * console.log('Secret:', result.value);
   * ```
   */
  async getSecret() {
    return this._request('/secret', {
      tool: '/secret',
    });
  }

  /**
   * Submits an answer for the demo task
   *
   * @param {string} answer - The answer text
   * @returns {Promise<Object>} Result (empty object on success)
   *
   * @example
   * ```javascript
   * // Get secret and submit it as answer
   * const secret = await demoClient.getSecret();
   * await demoClient.submitAnswer(secret.value);
   * ```
   */
  async submitAnswer(answer) {
    return this._request('/answer', {
      tool: '/answer',
      answer: String(answer),
    });
  }

  // ============================================================================
  // Tool Dispatch (for LLM agents)
  // ============================================================================

  /**
   * Dispatches a demo request (for tool-based workflows)
   *
   * This method is useful for LLM agents that work with tool-based APIs.
   * It routes requests to the appropriate method based on the tool name.
   *
   * @param {Object} request - Request object with tool and parameters
   * @returns {Promise<Object>} Response from the appropriate endpoint
   *
   * @example
   * ```javascript
   * // Using dispatch for tool-based workflow
   * const secret = await demoClient.dispatch({ tool: '/secret' });
   * await demoClient.dispatch({ tool: '/answer', answer: secret.value });
   * ```
   */
  async dispatch(request) {
    const tool = request.tool;

    switch (tool) {
      case '/secret':
        return this.getSecret();
      case '/answer':
        return this.submitAnswer(request.answer);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }
}
