/**
 * ERC3 Store API Client
 *
 * Handles store-specific endpoints for product management, shopping cart, and checkout.
 * This is a separate API for the "store" benchmark that simulates an e-commerce platform.
 *
 * @module erc3-js/store
 */

import { ApiException } from '../common.js';

/**
 * Store API Client
 *
 * Provides methods for interacting with the ERC3 Store benchmark API.
 * The Store API simulates an e-commerce platform with products, shopping cart,
 * coupons, and checkout functionality.
 *
 * Features:
 * - Product catalog browsing with pagination
 * - Shopping basket management
 * - Coupon application
 * - Checkout process
 *
 * @example
 * ```javascript
 * import { ERC3 } from 'erc3-js';
 *
 * const client = new ERC3({ apiKey: 'your-api-key' });
 * const storeClient = client.getStoreClient('task-123');
 *
 * // List products
 * const products = await storeClient.listProducts();
 *
 * // Add to basket
 * await storeClient.addToBasket('SKU-001', 2);
 *
 * // Checkout
 * const result = await storeClient.checkout();
 * ```
 */
export class StoreClient {
  /**
   * Creates a Store API client instance
   *
   * @param {string} baseUrl - Base URL for the API
   * @param {string} taskId - Task ID for this store session
   */
  constructor(baseUrl, taskId) {
    this.baseUrl = baseUrl;
    this.taskId = taskId;
  }

  /**
   * Makes a POST request to the store API
   * @private
   */
  async _request(endpoint, data = {}) {
    const url = `${this.baseUrl}/store/${this.taskId}${endpoint}`;

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
  // Product Management
  // ============================================================================

  /**
   * Lists products with pagination
   *
   * Returns a paginated list of products. Use the `next_offset` field
   * to fetch subsequent pages.
   *
   * @param {Object} options - List options
   * @param {number} options.offset - Offset for pagination (default: 0)
   * @param {number} options.limit - Number of items per page (default: 20)
   * @returns {Promise<Object>} Products list with next_offset
   *
   * @example
   * ```javascript
   * // Get first page
   * const page1 = await storeClient.listProducts({ offset: 0, limit: 20 });
   * console.log(page1.products);
   *
   * // Get next page if available
   * if (page1.next_offset) {
   *   const page2 = await storeClient.listProducts({ offset: page1.next_offset, limit: 20 });
   * }
   * ```
   */
  async listProducts({ offset = 0, limit = 20 } = {}) {
    return this._request('/products/list', {
      tool: '/products/list',
      offset,
      limit,
    });
  }

  // ============================================================================
  // Shopping Basket
  // ============================================================================

  /**
   * Views current shopping basket
   *
   * Returns the current state of the shopping basket including items,
   * prices, discounts, and totals.
   *
 * Note: Prices are returned in dollars (no division needed for display)
   *
   * @returns {Promise<Object>} Basket contents with items, subtotal, discount, total
   *
   * @example
   * ```javascript
   * const basket = await storeClient.viewBasket();
   * console.log('Items:', basket.items);
   * console.log('Total:', basket.total / 100); // Convert cents to dollars
   * ```
   */
  async viewBasket() {
    return this._request('/basket/view', {
      tool: '/basket/view',
    });
  }

  /**
   * Adds a product to the basket
   *
   * @param {string} sku - Product SKU
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Promise<Object>} Updated basket info with line_count and item_count
   *
   * @example
   * ```javascript
   * // Add 2 units of a product
   * await storeClient.addToBasket('SKU-001', 2);
   *
   * // Add 1 unit (default quantity)
   * await storeClient.addToBasket('SKU-002');
   * ```
   */
  async addToBasket(sku, quantity = 1) {
    return this._request('/basket/add', {
      tool: '/basket/add',
      sku,
      quantity,
    });
  }

  /**
   * Removes a product from the basket
   *
   * @param {string} sku - Product SKU
   * @param {number} quantity - Quantity to remove (default: 1)
   * @returns {Promise<Object>} Updated basket info with line_count and item_count
   *
   * @example
   * ```javascript
   * // Remove 1 unit
   * await storeClient.removeFromBasket('SKU-001', 1);
   *
   * // Remove all units of a product
   * const basket = await storeClient.viewBasket();
   * const item = basket.items.find(i => i.sku === 'SKU-001');
   * await storeClient.removeFromBasket('SKU-001', item.quantity);
   * ```
   */
  async removeFromBasket(sku, quantity = 1) {
    return this._request('/basket/remove', {
      tool: '/basket/remove',
      sku,
      quantity,
    });
  }

  /**
   * Checks out the basket
   *
   * Completes the purchase and returns the final order details.
   * After checkout, the basket is cleared.
   *
   * @returns {Promise<Object>} Checkout result with final items, subtotal, discount, total
   *
   * @example
   * ```javascript
   * const result = await storeClient.checkout();
   * console.log('Order total:', result.total / 100);
   * console.log('Items purchased:', result.items);
   * ```
   */
  async checkout() {
    return this._request('/basket/checkout', {
      tool: '/basket/checkout',
    });
  }

  // ============================================================================
  // Coupons
  // ============================================================================

  /**
   * Applies a coupon code to the basket
   *
   * Applies a discount coupon to the current basket. Only one coupon
   * can be applied at a time.
   *
   * @param {string} coupon - Coupon code
   * @returns {Promise<Object>} Result (empty object on success)
   *
   * @example
   * ```javascript
   * // Apply a coupon
   * await storeClient.applyCoupon('SAVE20');
   *
   * // View updated basket with discount
   * const basket = await storeClient.viewBasket();
   * console.log('Discount:', basket.discount / 100);
   * ```
   */
  async applyCoupon(coupon) {
    return this._request('/coupon/apply', {
      tool: '/coupon/apply',
      coupon,
    });
  }

  /**
   * Removes the currently applied coupon
   *
   * @returns {Promise<Object>} Result (empty object on success)
   *
   * @example
   * ```javascript
   * await storeClient.removeCoupon();
   * ```
   */
  async removeCoupon() {
    return this._request('/coupon/remove', {
      tool: '/coupon/remove',
    });
  }

  // ============================================================================
  // Tool Dispatch (for LLM agents)
  // ============================================================================

  /**
   * Dispatches a store request (for tool-based workflows)
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
   * const result = await storeClient.dispatch({
   *   tool: '/products/list',
   *   offset: 0,
   *   limit: 20
   * });
   * ```
   */
  async dispatch(request) {
    const tool = request.tool;

    switch (tool) {
      case '/products/list':
        return this.listProducts({
          offset: request.offset,
          limit: request.limit
        });
      case '/basket/view':
        return this.viewBasket();
      case '/basket/add':
        return this.addToBasket(request.sku, request.quantity);
      case '/basket/remove':
        return this.removeFromBasket(request.sku, request.quantity);
      case '/basket/checkout':
        return this.checkout();
      case '/coupon/apply':
        return this.applyCoupon(request.coupon);
      case '/coupon/remove':
        return this.removeCoupon();
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }
}
