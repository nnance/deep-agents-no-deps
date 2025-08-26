/**
 * Utility functions for HTTP operations
 */

import { URL } from 'url';
import { BackoffConfig } from './types.js';

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Calculate backoff delay with optional jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: BackoffConfig
): number {
  const { initialDelay, multiplier, maxDelay, jitter } = config;
  
  // Calculate exponential backoff: initialDelay * (multiplier ^ attempt)
  let delay = initialDelay * Math.pow(multiplier, attempt);
  
  // Apply maximum delay cap
  delay = Math.min(delay, maxDelay);
  
  // Apply jitter if enabled: actualDelay = delay * (0.5 + random() * 0.5)
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.floor(delay);
}

/**
 * Check if HTTP status code indicates a retryable error
 */
export function isRetryableStatus(status: number): boolean {
  // Only retry on 500 Internal Server Error
  return status === 500;
}

/**
 * Check if error is retryable (network errors, timeouts)
 */
export function isRetryableError(error: Error & { code?: string }): boolean {
  const retryableCodes = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ENETUNREACH',
    'EHOSTUNREACH'
  ];
  
  return error.code ? retryableCodes.includes(error.code) : false;
}

/**
 * Get content type from headers
 */
export function getContentType(headers: Record<string, unknown>): string {
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (Array.isArray(contentType)) {
    return contentType[0] || 'text/plain';
  }
  return (contentType as string) || 'text/plain';
}

/**
 * Serialize request body based on content type
 */
export function serializeBody(body: unknown, contentType: string): string {
  if (body === null || body === undefined) {
    return '';
  }

  if (typeof body === 'string') {
    return body;
  }

  if (contentType.includes('application/json')) {
    return JSON.stringify(body);
  }

  // For other content types, convert to string
  return String(body);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a promise that rejects after specified timeout
 */
export function createTimeoutPromise<T>(timeout: number): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
  });
}
