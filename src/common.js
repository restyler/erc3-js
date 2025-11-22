/**
 * Common utilities and classes for ERC3 SDK
 * @module erc3-js/common
 */

/**
 * Custom error class for API exceptions
 */
export class ApiException extends Error {
  constructor(message, status, code, detail) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}
