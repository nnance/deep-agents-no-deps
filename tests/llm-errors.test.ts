/**
 * Unit tests for LLM Provider Errors (Phase 1.1)
 * Tests error class instantiation, inheritance, and utility functions
 */

import { test, describe } from 'node:test';
import { strictEqual, ok, deepStrictEqual } from 'node:assert';
import {
  LLMError,
  ConfigurationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  QuotaExceededError,
  NetworkError,
  TimeoutError,
  ModelError,
  ContentFilterError,
  TokenLimitError,
  ResponseParsingError,
  UnexpectedResponseError,
  ProviderUnavailableError,
  ProviderNotFoundError,
  isLLMError,
  isRetryableError,
  getErrorSeverity
} from '../src/core/llm/errors.js';

describe('LLM Provider Errors - Phase 1.1', () => {

  describe('Base LLMError', () => {
    test('should create error with required properties', () => {
      const error = new LLMError('Test message', 'TEST_CODE');
      
      strictEqual(error.name, 'LLMError');
      strictEqual(error.message, 'Test message');
      strictEqual(error.code, 'TEST_CODE');
      strictEqual(error.provider, undefined);
      strictEqual(error.requestId, undefined);
      deepStrictEqual(error.metadata, {});
      ok(error.stack);
    });

    test('should create error with all properties', () => {
      const metadata = { customField: 'value', timestamp: 123456 };
      const error = new LLMError(
        'Full test message',
        'FULL_TEST_CODE',
        'openai',
        'req-123',
        metadata
      );
      
      strictEqual(error.message, 'Full test message');
      strictEqual(error.code, 'FULL_TEST_CODE');
      strictEqual(error.provider, 'openai');
      strictEqual(error.requestId, 'req-123');
      deepStrictEqual(error.metadata, metadata);
    });

    test('should freeze metadata object', () => {
      const metadata = { mutable: 'test' };
      const error = new LLMError('Test', 'TEST', undefined, undefined, metadata);
      
      // Metadata should be frozen
      ok(Object.isFrozen(error.metadata));
      
      // Original metadata should not affect error metadata
      metadata.mutable = 'changed';
      strictEqual(error.metadata['mutable'], 'test');
    });
  });

  describe('ConfigurationError', () => {
    test('should extend LLMError with field property', () => {
      const error = new ConfigurationError('Invalid config', 'apiKey', 'openai');
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ConfigurationError');
      strictEqual(error.code, 'CONFIGURATION_ERROR');
      strictEqual(error.field, 'apiKey');
      strictEqual(error.provider, 'openai');
    });

    test('should work without optional field', () => {
      const error = new ConfigurationError('General config error');
      
      strictEqual(error.field, undefined);
      strictEqual(error.provider, undefined);
    });
  });

  describe('ValidationError', () => {
    test('should store validation errors as readonly array', () => {
      const validationErrors = ['Error 1', 'Error 2', 'Error 3'];
      const error = new ValidationError('Validation failed', validationErrors, 'anthropic');
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ValidationError');
      strictEqual(error.code, 'VALIDATION_ERROR');
      strictEqual(error.validationErrors.length, 3);
      ok(error.validationErrors.includes('Error 1'));
      ok(Object.isFrozen(error.validationErrors));
    });
  });

  describe('AuthenticationError', () => {
    test('should create authentication error', () => {
      const error = new AuthenticationError('Invalid API key', 'openai', 'req-123');
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'AuthenticationError');
      strictEqual(error.code, 'AUTHENTICATION_ERROR');
      strictEqual(error.provider, 'openai');
      strictEqual(error.requestId, 'req-123');
    });
  });

  describe('AuthorizationError', () => {
    test('should create authorization error', () => {
      const error = new AuthorizationError('Access denied', 'openai', 'req-456');
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'AuthorizationError');
      strictEqual(error.code, 'AUTHORIZATION_ERROR');
    });
  });

  describe('RateLimitError', () => {
    test('should create rate limit error with retry after', () => {
      const error = new RateLimitError('Rate limited', 'openai', 'req-789', 60);
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'RateLimitError');
      strictEqual(error.code, 'RATE_LIMIT_ERROR');
      strictEqual(error.retryAfter, 60);
    });
  });

  describe('QuotaExceededError', () => {
    test('should create quota error with type and reset time', () => {
      const resetTime = new Date('2024-02-01T00:00:00Z');
      const error = new QuotaExceededError(
        'Daily quota exceeded',
        'daily',
        'openai',
        'req-101',
        resetTime
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'QuotaExceededError');
      strictEqual(error.quotaType, 'daily');
      strictEqual(error.resetTime, resetTime);
    });
  });

  describe('NetworkError', () => {
    test('should create network error with status code', () => {
      const error = new NetworkError('Connection failed', 'openai', 'req-102', 503);
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'NetworkError');
      strictEqual(error.code, 'NETWORK_ERROR');
      strictEqual(error.statusCode, 503);
      strictEqual(error.isTimeout, false);
    });

    test('should create timeout network error', () => {
      const error = new NetworkError('Timeout', 'openai', 'req-103', undefined, true);
      
      strictEqual(error.isTimeout, true);
      strictEqual(error.statusCode, undefined);
    });
  });

  describe('TimeoutError', () => {
    test('should extend NetworkError with timeout properties', () => {
      const error = new TimeoutError('Request timeout', 30000, 'openai', 'req-104');
      
      ok(error instanceof NetworkError);
      ok(error instanceof LLMError);
      strictEqual(error.name, 'TimeoutError');
      strictEqual(error.code, 'TIMEOUT_ERROR');
      strictEqual(error.timeoutMs, 30000);
      strictEqual(error.isTimeout, true);
    });
  });

  describe('ModelError', () => {
    test('should create model error with model name', () => {
      const error = new ModelError('Model not found', 'gpt-5', 'openai', 'req-105');
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ModelError');
      strictEqual(error.model, 'gpt-5');
    });
  });

  describe('ContentFilterError', () => {
    test('should create content filter error with type and finish reason', () => {
      const error = new ContentFilterError(
        'Content filtered',
        'output',
        'content_filter',
        'openai',
        'req-106'
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ContentFilterError');
      strictEqual(error.filterType, 'output');
      strictEqual(error.finishReason, 'content_filter');
    });
  });

  describe('TokenLimitError', () => {
    test('should create token limit error with token counts', () => {
      const error = new TokenLimitError(
        'Token limit exceeded',
        4096,
        5000,
        'openai',
        'req-107'
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'TokenLimitError');
      strictEqual(error.maxTokens, 4096);
      strictEqual(error.attemptedTokens, 5000);
    });
  });

  describe('ResponseParsingError', () => {
    test('should create parsing error with raw response', () => {
      const rawResponse = { invalid: 'response', structure: true };
      const error = new ResponseParsingError(
        'Failed to parse response',
        rawResponse,
        'anthropic',
        'req-108'
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ResponseParsingError');
      strictEqual(error.rawResponse, rawResponse);
    });
  });

  describe('UnexpectedResponseError', () => {
    test('should create unexpected response error with status and response', () => {
      const rawResponse = { error: 'Server error' };
      const error = new UnexpectedResponseError(
        'Unexpected response',
        500,
        rawResponse,
        'ollama',
        'req-109'
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'UnexpectedResponseError');
      strictEqual(error.statusCode, 500);
      strictEqual(error.rawResponse, rawResponse);
    });
  });

  describe('ProviderUnavailableError', () => {
    test('should create provider unavailable error', () => {
      const error = new ProviderUnavailableError(
        'Provider temporarily unavailable',
        'ollama',
        'req-110',
        120
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ProviderUnavailableError');
      strictEqual(error.retryAfter, 120);
    });
  });

  describe('ProviderNotFoundError', () => {
    test('should create provider not found error with available providers', () => {
      const availableProviders = ['openai', 'anthropic'] as const;
      const error = new ProviderNotFoundError(
        'Provider not found',
        availableProviders
      );
      
      ok(error instanceof LLMError);
      strictEqual(error.name, 'ProviderNotFoundError');
      strictEqual(error.availableProviders.length, 2);
      ok(error.availableProviders.includes('openai'));
      ok(Object.isFrozen(error.availableProviders));
    });
  });

  describe('Utility Functions', () => {
    describe('isLLMError', () => {
      test('should identify LLM errors correctly', () => {
        const llmError = new LLMError('Test', 'TEST');
        const configError = new ConfigurationError('Config error');
        const standardError = new Error('Standard error');
        const notError = 'not an error';

        ok(isLLMError(llmError));
        ok(isLLMError(configError));
        ok(!isLLMError(standardError));
        ok(!isLLMError(notError));
        ok(!isLLMError(null));
        ok(!isLLMError(undefined));
      });
    });

    describe('isRetryableError', () => {
      test('should identify retryable errors', () => {
        const networkError = new NetworkError('Network failure');
        const timeoutError = new TimeoutError('Timeout', 30000);
        const rateLimitError = new RateLimitError('Rate limited');
        const providerError = new ProviderUnavailableError('Unavailable');
        const serverError = new UnexpectedResponseError('Server error', 500);
        
        ok(isRetryableError(networkError));
        ok(isRetryableError(timeoutError));
        ok(isRetryableError(rateLimitError));
        ok(isRetryableError(providerError));
        ok(isRetryableError(serverError));
      });

      test('should identify non-retryable errors', () => {
        const authError = new AuthenticationError('Invalid key');
        const configError = new ConfigurationError('Bad config');
        const clientError = new UnexpectedResponseError('Client error', 400);
        const standardError = new Error('Standard error');
        
        ok(!isRetryableError(authError));
        ok(!isRetryableError(configError));
        ok(!isRetryableError(clientError));
        ok(!isRetryableError(standardError));
        ok(!isRetryableError('not an error'));
      });
    });

    describe('getErrorSeverity', () => {
      test('should return critical severity for config/auth errors', () => {
        const authError = new AuthenticationError('Auth failed');
        const configError = new ConfigurationError('Config invalid');
        const validationError = new ValidationError('Validation failed', ['error']);
        
        strictEqual(getErrorSeverity(authError), 'critical');
        strictEqual(getErrorSeverity(configError), 'critical');
        strictEqual(getErrorSeverity(validationError), 'critical');
      });

      test('should return high severity for authorization/quota errors', () => {
        const authzError = new AuthorizationError('Access denied');
        const quotaError = new QuotaExceededError('Quota exceeded', 'daily');
        const filterError = new ContentFilterError('Filtered', 'output', 'content_filter');
        
        strictEqual(getErrorSeverity(authzError), 'high');
        strictEqual(getErrorSeverity(quotaError), 'high');
        strictEqual(getErrorSeverity(filterError), 'high');
      });

      test('should return medium severity for rate/token/model errors', () => {
        const rateError = new RateLimitError('Rate limited');
        const tokenError = new TokenLimitError('Token limit', 100, 200);
        const modelError = new ModelError('Model error');
        
        strictEqual(getErrorSeverity(rateError), 'medium');
        strictEqual(getErrorSeverity(tokenError), 'medium');
        strictEqual(getErrorSeverity(modelError), 'medium');
      });

      test('should return low severity for other LLM errors', () => {
        const networkError = new NetworkError('Network failure');
        const parseError = new ResponseParsingError('Parse failed');
        
        strictEqual(getErrorSeverity(networkError), 'low');
        strictEqual(getErrorSeverity(parseError), 'low');
      });

      test('should return medium severity for non-LLM errors', () => {
        const standardError = new Error('Standard error');
        const notError = 'not an error';
        
        strictEqual(getErrorSeverity(standardError), 'medium');
        strictEqual(getErrorSeverity(notError), 'medium');
      });
    });
  });

  describe('Error Inheritance', () => {
    test('should maintain proper inheritance chain', () => {
      const timeoutError = new TimeoutError('Timeout', 5000);
      
      ok(timeoutError instanceof TimeoutError);
      ok(timeoutError instanceof NetworkError);
      ok(timeoutError instanceof LLMError);
      ok(timeoutError instanceof Error);
    });

    test('should preserve stack trace', () => {
      const error = new ConfigurationError('Config error');
      ok(error.stack);
      ok(error.stack?.includes('ConfigurationError'));
    });
  });

  describe('Error Immutability', () => {
    test('should freeze arrays in error properties', () => {
      const validationError = new ValidationError('Validation failed', ['error1', 'error2']);
      const notFoundError = new ProviderNotFoundError('Not found', ['openai', 'anthropic']);
      
      ok(Object.isFrozen(validationError.validationErrors));
      ok(Object.isFrozen(notFoundError.availableProviders));
    });

    test('should freeze metadata objects', () => {
      const metadata = { key: 'value', nested: { prop: 'test' } };
      const error = new LLMError('Test', 'TEST', undefined, undefined, metadata);
      
      ok(Object.isFrozen(error.metadata));
      
      // Original metadata should not affect error
      metadata.key = 'changed';
      strictEqual(error.metadata['key'], 'value');
    });
  });
});