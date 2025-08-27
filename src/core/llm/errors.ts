/**
 * LLM Provider Error Hierarchy
 * 
 * Defines custom error classes for consistent error handling across all LLM providers.
 * Follows functional programming principles with immutable error data and clear error types.
 */

import type { FinishReason, ProviderType } from './types.js';

// Base LLM error class
export class LLMError extends Error {
  readonly code: string;
  readonly provider?: ProviderType;
  readonly requestId?: string;
  readonly metadata: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    if (provider !== undefined) this.provider = provider;
    if (requestId !== undefined) this.requestId = requestId;
    this.metadata = Object.freeze({ ...metadata });
    
    // Maintain proper stack trace for where our error was thrown
    Error.captureStackTrace(this, LLMError);
  }
}

// Configuration and validation errors
export class ConfigurationError extends LLMError {
  readonly field?: string;

  constructor(
    message: string,
    field?: string,
    provider?: ProviderType,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'CONFIGURATION_ERROR', provider, undefined, metadata);
    this.name = 'ConfigurationError';
    if (field !== undefined) this.field = field;
  }
}

export class ValidationError extends LLMError {
  readonly validationErrors: readonly string[];

  constructor(
    message: string,
    validationErrors: readonly string[],
    provider?: ProviderType,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'VALIDATION_ERROR', provider, undefined, metadata);
    this.name = 'ValidationError';
    this.validationErrors = Object.freeze([...validationErrors]);
  }
}

// Authentication and authorization errors
export class AuthenticationError extends LLMError {
  constructor(
    message: string,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'AUTHENTICATION_ERROR', provider, requestId, metadata);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends LLMError {
  constructor(
    message: string,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'AUTHORIZATION_ERROR', provider, requestId, metadata);
    this.name = 'AuthorizationError';
  }
}

// Rate limiting and quota errors
export class RateLimitError extends LLMError {
  readonly retryAfter?: number;
  readonly dailyLimit?: number;
  readonly monthlyLimit?: number;

  constructor(
    message: string,
    provider?: ProviderType,
    requestId?: string,
    retryAfter?: number,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'RATE_LIMIT_ERROR', provider, requestId, metadata);
    this.name = 'RateLimitError';
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}

export class QuotaExceededError extends LLMError {
  readonly quotaType: 'daily' | 'monthly' | 'total';
  readonly resetTime?: Date;

  constructor(
    message: string,
    quotaType: 'daily' | 'monthly' | 'total',
    provider?: ProviderType,
    requestId?: string,
    resetTime?: Date,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'QUOTA_EXCEEDED_ERROR', provider, requestId, metadata);
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType;
    if (resetTime !== undefined) this.resetTime = resetTime;
  }
}

// Network and timeout errors
export class NetworkError extends LLMError {
  readonly statusCode?: number;
  readonly isTimeout: boolean;

  constructor(
    message: string,
    provider?: ProviderType,
    requestId?: string,
    statusCode?: number,
    isTimeout = false,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'NETWORK_ERROR', provider, requestId, metadata);
    this.name = 'NetworkError';
    if (statusCode !== undefined) this.statusCode = statusCode;
    this.isTimeout = isTimeout;
  }
}

export class TimeoutError extends NetworkError {
  readonly timeoutMs: number;

  constructor(
    message: string,
    timeoutMs: number,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, provider, requestId, undefined, true, metadata);
    this.name = 'TimeoutError';
    // Override the inherited code from NetworkError
    Object.defineProperty(this, 'code', {
      value: 'TIMEOUT_ERROR',
      writable: false,
      enumerable: true,
      configurable: false
    });
    this.timeoutMs = timeoutMs;
  }
}

// Model and content errors
export class ModelError extends LLMError {
  readonly model?: string;

  constructor(
    message: string,
    model?: string,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'MODEL_ERROR', provider, requestId, metadata);
    this.name = 'ModelError';
    if (model !== undefined) this.model = model;
  }
}

export class ContentFilterError extends LLMError {
  readonly filterType: 'input' | 'output';
  readonly finishReason: FinishReason;

  constructor(
    message: string,
    filterType: 'input' | 'output',
    finishReason: FinishReason,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'CONTENT_FILTER_ERROR', provider, requestId, metadata);
    this.name = 'ContentFilterError';
    this.filterType = filterType;
    this.finishReason = finishReason;
  }
}

export class TokenLimitError extends LLMError {
  readonly maxTokens: number;
  readonly attemptedTokens: number;

  constructor(
    message: string,
    maxTokens: number,
    attemptedTokens: number,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'TOKEN_LIMIT_ERROR', provider, requestId, metadata);
    this.name = 'TokenLimitError';
    this.maxTokens = maxTokens;
    this.attemptedTokens = attemptedTokens;
  }
}

// Response and parsing errors
export class ResponseParsingError extends LLMError {
  readonly rawResponse?: unknown;

  constructor(
    message: string,
    rawResponse?: unknown,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'RESPONSE_PARSING_ERROR', provider, requestId, metadata);
    this.name = 'ResponseParsingError';
    this.rawResponse = rawResponse;
  }
}

export class UnexpectedResponseError extends LLMError {
  readonly statusCode: number;
  readonly rawResponse?: unknown;

  constructor(
    message: string,
    statusCode: number,
    rawResponse?: unknown,
    provider?: ProviderType,
    requestId?: string,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'UNEXPECTED_RESPONSE_ERROR', provider, requestId, metadata);
    this.name = 'UnexpectedResponseError';
    this.statusCode = statusCode;
    this.rawResponse = rawResponse;
  }
}

// Provider availability errors
export class ProviderUnavailableError extends LLMError {
  readonly retryAfter?: number;

  constructor(
    message: string,
    provider?: ProviderType,
    requestId?: string,
    retryAfter?: number,
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'PROVIDER_UNAVAILABLE_ERROR', provider, requestId, metadata);
    this.name = 'ProviderUnavailableError';
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}

export class ProviderNotFoundError extends LLMError {
  readonly availableProviders: readonly ProviderType[];

  constructor(
    message: string,
    availableProviders: readonly ProviderType[],
    metadata: Record<string, unknown> = {}
  ) {
    super(message, 'PROVIDER_NOT_FOUND_ERROR', undefined, undefined, metadata);
    this.name = 'ProviderNotFoundError';
    this.availableProviders = Object.freeze([...availableProviders]);
  }
}

// Utility functions for error handling
export function isLLMError(error: unknown): error is LLMError {
  return error instanceof LLMError;
}

export function isRetryableError(error: unknown): boolean {
  if (!isLLMError(error)) {
    return false;
  }

  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    error instanceof RateLimitError ||
    error instanceof ProviderUnavailableError ||
    (error instanceof UnexpectedResponseError && error.statusCode >= 500)
  );
}

export function getErrorSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
  if (!isLLMError(error)) {
    return 'medium';
  }

  if (
    error instanceof AuthenticationError ||
    error instanceof ConfigurationError ||
    error instanceof ValidationError
  ) {
    return 'critical';
  }

  if (
    error instanceof AuthorizationError ||
    error instanceof QuotaExceededError ||
    error instanceof ContentFilterError
  ) {
    return 'high';
  }

  if (
    error instanceof RateLimitError ||
    error instanceof TokenLimitError ||
    error instanceof ModelError
  ) {
    return 'medium';
  }

  return 'low';
}