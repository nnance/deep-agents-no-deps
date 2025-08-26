/**
 * Core HTTP client implementation with retry logic
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { OutgoingHttpHeaders } from 'http';

import { Logger, createLogger, LogFormat } from '../logging/index.js';
import {
  RequestOptions,
  Response,
  HttpError,
  TimeoutError,
  RetryExhaustedError,
  NetworkError,
  BackoffConfig,
  GlobalConfig,
  ClientConfig
} from './types.js';
import { ResponseImpl } from './response.js';
import { getGlobalConfig } from './config.js';
import {
  buildUrl,
  calculateBackoffDelay,
  isRetryableStatus,
  isRetryableError as isRetryableNetworkError,
  getContentType,
  serializeBody,
  sleep,
  createTimeoutPromise
} from './utils.js';

/**
 * Core HTTP client implementation
 */
export class HttpClient {
  private logger: Logger;
  private config: GlobalConfig;

  constructor(clientConfig?: ClientConfig) {
    const globalConfig = getGlobalConfig();
    
    this.config = {
      maxRetries: clientConfig?.maxRetries ?? globalConfig.maxRetries,
      requestTimeout: clientConfig?.requestTimeout ?? globalConfig.requestTimeout,
      globalTimeout: clientConfig?.globalTimeout ?? globalConfig.globalTimeout,
      backoff: {
        initialDelay: clientConfig?.backoff?.initialDelay ?? globalConfig.backoff.initialDelay,
        multiplier: clientConfig?.backoff?.multiplier ?? globalConfig.backoff.multiplier,
        maxDelay: clientConfig?.backoff?.maxDelay ?? globalConfig.backoff.maxDelay,
        jitter: clientConfig?.backoff?.jitter ?? globalConfig.backoff.jitter
      },
      logging: {
        level: clientConfig?.logging?.level ?? globalConfig.logging.level,
        logRetries: clientConfig?.logging?.logRetries ?? globalConfig.logging.logRetries
      }
    };

    this.logger = createLogger({
      level: this.config.logging.level as any,
      format: LogFormat.Text,
      transports: []
    });
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(options: RequestOptions): Promise<Response> {
    const startTime = Date.now();
    const config = this.mergeRequestConfig(options);
    
    this.logger.debug('Starting HTTP request', {
      method: options.method,
      url: options.url,
      maxRetries: config.maxRetries
    });

    let lastError: Error | null = null;
    let attemptNumber = 0; // 0-based: 0 = first attempt, 1 = first retry, etc.
    const maxAttempts = 1 + config.maxRetries; // total attempts = initial + retries

    while (attemptNumber < maxAttempts) {
      try {
        // Check global timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= config.globalTimeout) {
          throw new TimeoutError(
            `Global timeout exceeded after ${elapsed}ms`,
            config.globalTimeout,
            elapsed
          );
        }

        const response = await this.executeRequest(options, config, attemptNumber);
        
        this.logger.debug('HTTP request successful', {
          method: options.method,
          url: options.url,
          status: response.status,
          attempts: attemptNumber + 1,
          elapsedTime: Date.now() - startTime
        });

        return response;

      } catch (error) {
        lastError = error as Error;
        attemptNumber++;

        // If this was the last attempt or error is not retryable, break out of loop
        if (attemptNumber >= maxAttempts || !this.canRetry(error as Error)) {
          // If error is not retryable at all (e.g. 404), throw original error
          if (!this.canRetry(error as Error)) {
            throw error;
          }
          // Otherwise we exhausted retries, break to throw RetryExhaustedError
          break;
        }

        // We can retry - calculate backoff and sleep
        const retryNumber = attemptNumber; // which retry this will be (1-based)
        const delay = calculateBackoffDelay(retryNumber - 1, config.backoff);
        
        if (config.logging.logRetries) {
          this.logger.warn('HTTP request failed, retrying', {
            method: options.method,
            url: options.url,
            attempt: attemptNumber,
            maxAttempts: maxAttempts,
            delay,
            error: (error as Error).message
          });
        }

        await sleep(delay);
      }
    }

    // All attempts exhausted - this should not be reached due to logic above
    const elapsed = Date.now() - startTime;
    throw new RetryExhaustedError(
      `Maximum retries (${config.maxRetries}) exceeded after ${elapsed}ms`,
      attemptNumber,
      elapsed,
      lastError!
    );
  }

  /**
   * Stream HTTP response
   */
  async requestStream(
    options: RequestOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const config = this.mergeRequestConfig(options);
    const url = buildUrl(options.url, options.params);
    const urlObj = new URL(url);
    
    const requestOptions: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method,
      headers: {
        ...config.headers,
        ...options.headers
      },
      timeout: config.requestTimeout
    };

    return new Promise((resolve, reject) => {
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(requestOptions, (res) => {
        res.on('data', (chunk: Buffer) => {
          onChunk(chunk.toString());
        });
        
        res.on('end', () => {
          resolve();
        });
        
        res.on('error', reject);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new TimeoutError(
          `Request timeout after ${config.requestTimeout}ms`,
          config.requestTimeout,
          config.requestTimeout
        ));
      });

      req.on('error', (error: Error & { code?: string }) => {
        reject(new NetworkError(
          `Network error: ${error.message}`,
          error.code || 'UNKNOWN',
          error
        ));
      });

      // Send request body for POST/PUT
      if (options.method !== 'GET' && options.body !== undefined) {
        const contentType = getContentType(options.headers as Record<string, unknown> || {});
        const serializedBody = serializeBody(options.body, contentType);
        req.write(serializedBody);
      }

      req.end();
    });
  }

  /**
   * Execute single HTTP request
   */
  private async executeRequest(
    options: RequestOptions,
    config: any,
    attempt: number
  ): Promise<Response> {
    const url = buildUrl(options.url, options.params);
    const urlObj = new URL(url);
    
    const headers: OutgoingHttpHeaders = {
      ...config.headers,
      ...options.headers
    };

    // Set content-type for POST/PUT if body exists and no content-type set
    if (options.method !== 'GET' && options.body !== undefined) {
      if (!headers['content-type'] && !headers['Content-Type']) {
        headers['content-type'] = 'application/json';
      }
    }

    const requestOptions: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method,
      headers,
      timeout: config.requestTimeout
    };

    return new Promise((resolve, reject) => {
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(requestOptions, (res) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          const body = Buffer.concat(chunks);
          const response = new ResponseImpl(
            res.statusCode || 0,
            res.statusMessage || '',
            res.headers,
            body
          );

          // Check if status indicates retryable error
          if (isRetryableStatus(response.status)) {
            reject(new HttpError(
              `HTTP ${response.status}: ${response.statusText}`,
              response.status,
              response.statusText,
              response.headers,
              response.body
            ));
          } else if (response.status >= 400) {
            // Non-retryable client or server error
            reject(new HttpError(
              `HTTP ${response.status}: ${response.statusText}`,
              response.status,
              response.statusText,
              response.headers,
              response.body
            ));
          } else {
            resolve(response);
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new TimeoutError(
          `Request timeout after ${config.requestTimeout}ms`,
          config.requestTimeout,
          config.requestTimeout
        ));
      });

      req.on('error', (error: Error & { code?: string }) => {
        reject(new NetworkError(
          `Network error: ${error.message}`,
          error.code || 'UNKNOWN',
          error
        ));
      });

      // Send request body for POST/PUT
      if (options.method !== 'GET' && options.body !== undefined) {
        const contentType = getContentType(headers as Record<string, unknown>);
        const serializedBody = serializeBody(options.body, contentType);
        req.write(serializedBody);
      }

      req.end();
    });
  }

  /**
   * Check if error should trigger a retry (simplified version)
   */
  private canRetry(error: Error): boolean {
    // Retryable errors: HttpError with 500 status, TimeoutError, NetworkError
    if (error instanceof HttpError) {
      return isRetryableStatus(error.status);
    }

    if (error instanceof TimeoutError || error instanceof NetworkError) {
      return true;
    }

    // Check for specific error codes
    const networkError = error as Error & { code?: string };
    if (networkError.code && isRetryableNetworkError(networkError)) {
      return true;
    }

    return false;
  }

  /**
   * Check if error should trigger a retry
   */
  private isRetryableError(error: Error, attempt: number, maxRetries: number): boolean {
    // attempt is 0-based, so we compare with maxRetries directly
    if (attempt >= maxRetries) {
      return false;
    }

    return this.canRetry(error);
  }

  /**
   * Merge request configuration with client and global defaults
   */
  private mergeRequestConfig(options: RequestOptions): any {
    // Always get fresh global config to respect setGlobalConfig calls
    const currentGlobalConfig = getGlobalConfig();
    
    // Precedence: request options > current global config > client config (from constructor)
    return {
      maxRetries: options.maxRetries ?? currentGlobalConfig.maxRetries,
      requestTimeout: options.timeout ?? currentGlobalConfig.requestTimeout,
      globalTimeout: options.globalTimeout ?? currentGlobalConfig.globalTimeout,
      backoff: {
        ...currentGlobalConfig.backoff,
        ...this.config.backoff,
        ...options.backoff
      },
      logging: {
        ...currentGlobalConfig.logging,
        ...this.config.logging,
        ...options.logging
      },
      headers: {}
    };
  }
}
