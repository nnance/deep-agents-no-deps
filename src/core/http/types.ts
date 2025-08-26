/**
 * Core HTTP library types and interfaces
 */

import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

/**
 * HTTP methods supported by the library
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT';

/**
 * Request configuration options
 */
export interface RequestOptions {
  url: string;
  method: HttpMethod;
  headers?: OutgoingHttpHeaders;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  maxRetries?: number;
  globalTimeout?: number;
  backoff?: BackoffConfig;
  logging?: LoggingConfig;
}

/**
 * GET request specific options
 */
export interface GetOptions {
  headers?: OutgoingHttpHeaders;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  maxRetries?: number;
  globalTimeout?: number;
  backoff?: BackoffConfig;
  logging?: LoggingConfig;
}

/**
 * POST/PUT request specific options
 */
export interface PostOptions {
  headers?: OutgoingHttpHeaders;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  maxRetries?: number;
  globalTimeout?: number;
  backoff?: BackoffConfig;
  logging?: LoggingConfig;
}

/**
 * PUT request specific options (alias for PostOptions)
 */
export type PutOptions = PostOptions;

/**
 * HTTP Response object
 */
export interface Response {
  status: number;
  statusText: string;
  headers: IncomingHttpHeaders;
  body: unknown;
  text(): string;
  json<T = unknown>(): T;
}

/**
 * Backoff strategy configuration
 */
export interface BackoffConfig {
  initialDelay: number;
  multiplier: number;
  maxDelay: number;
  jitter: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  backoff: BackoffConfig;
}

/**
 * Logging configuration for HTTP operations
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  logRetries: boolean;
}

/**
 * Client-level configuration
 */
export interface ClientConfig {
  maxRetries?: number;
  requestTimeout?: number;
  globalTimeout?: number;
  backoff?: Partial<BackoffConfig>;
  logging?: Partial<LoggingConfig>;
  headers?: OutgoingHttpHeaders;
}

/**
 * Global configuration
 */
export interface GlobalConfig {
  maxRetries: number;
  requestTimeout: number;
  globalTimeout: number;
  backoff: BackoffConfig;
  logging: LoggingConfig;
}

/**
 * HTTP Client interface
 */
export interface HttpClient {
  get(url: string, options?: GetOptions): Promise<Response>;
  post(url: string, body: unknown, options?: PostOptions): Promise<Response>;
  put(url: string, body: unknown, options?: PutOptions): Promise<Response>;
  request(options: RequestOptions): Promise<Response>;
  requestStream(options: RequestOptions, onChunk: (chunk: string) => void): Promise<void>;
}

/**
 * Error types
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public headers: IncomingHttpHeaders,
    public body: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public timeout: number,
    public elapsedTime: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public elapsedTime: number,
    public lastError: Error
  ) {
    super(message);
    this.name = 'RetryExhaustedError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
