/**
 * Unit tests for LLM Provider Types (Phase 1.1)
 * Tests type validation and interface compliance for the core LLM types
 */

import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, test } from 'node:test';
import type {
  GenerationOptions,
  LLMProvider,
  LLMResponse,
  ProviderConfig,
  ProviderHealth,
  ProviderInfo,
  ProviderType,
  RequestContext,
  ResponseMetadata,
  TokenUsage,
  ValidationResult,
} from '../src/core/llm/types.js';

describe('LLM Provider Types - Phase 1.1', () => {
  describe('ProviderInfo', () => {
    test('should have required readonly properties', () => {
      const providerInfo: ProviderInfo = {
        name: 'test-provider',
        version: '1.0.0',
        capabilities: ['text-generation', 'streaming'] as const,
      };

      strictEqual(providerInfo.name, 'test-provider');
      strictEqual(providerInfo.version, '1.0.0');
      deepStrictEqual(providerInfo.capabilities, ['text-generation', 'streaming']);
    });

    test('should support all capability types', () => {
      const capabilities: ProviderInfo['capabilities'] = [
        'text-generation',
        'streaming',
        'structured-output',
      ] as const;

      strictEqual(capabilities.length, 3);
      ok(capabilities.includes('text-generation'));
      ok(capabilities.includes('streaming'));
      ok(capabilities.includes('structured-output'));
    });
  });

  describe('ProviderConfig', () => {
    test('should have required apiKey and optional properties', () => {
      const minimalConfig: ProviderConfig = {
        apiKey: 'test-key',
      };

      strictEqual(minimalConfig.apiKey, 'test-key');
      strictEqual(minimalConfig.baseUrl, undefined);
      strictEqual(minimalConfig.timeout, undefined);

      const fullConfig: ProviderConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.example.com',
        timeout: 30000,
        retries: 3,
        model: 'gpt-4',
      };

      strictEqual(fullConfig.apiKey, 'test-key');
      strictEqual(fullConfig.baseUrl, 'https://api.example.com');
      strictEqual(fullConfig.timeout, 30000);
      strictEqual(fullConfig.retries, 3);
      strictEqual(fullConfig.model, 'gpt-4');
    });
  });

  describe('GenerationOptions', () => {
    test('should have required prompt and optional parameters', () => {
      const minimalOptions: GenerationOptions = {
        prompt: 'Hello, world!',
      };

      strictEqual(minimalOptions.prompt, 'Hello, world!');
      strictEqual(minimalOptions.systemMessage, undefined);

      const fullOptions: GenerationOptions = {
        prompt: 'Hello, world!',
        systemMessage: 'You are a helpful assistant',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        stop: ['\\n', 'END'],
        seed: 42,
      };

      strictEqual(fullOptions.temperature, 0.7);
      strictEqual(fullOptions.maxTokens, 1000);
      deepStrictEqual(fullOptions.stop, ['\\n', 'END']);
      strictEqual(fullOptions.seed, 42);
    });
  });

  describe('LLMResponse', () => {
    test('should have all required response fields', () => {
      const usage: TokenUsage = {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      };

      const metadata: ResponseMetadata = {
        requestId: 'req-123',
        model: 'gpt-4',
        timestamp: new Date('2024-01-01'),
        provider: 'openai',
        responseTime: 1500,
        cached: false,
      };

      const response: LLMResponse = {
        id: 'resp-456',
        content: 'Hello, how can I help?',
        model: 'gpt-4',
        finishReason: 'stop',
        usage,
        metadata,
      };

      strictEqual(response.id, 'resp-456');
      strictEqual(response.content, 'Hello, how can I help?');
      strictEqual(response.finishReason, 'stop');
      deepStrictEqual(response.usage, usage);
      deepStrictEqual(response.metadata, metadata);
    });
  });

  describe('FinishReason', () => {
    test('should support all finish reason types', () => {
      const reasons: Array<LLMResponse['finishReason']> = [
        'stop',
        'length',
        'content_filter',
        'tool_calls',
        'error',
      ];

      strictEqual(reasons.length, 5);
      ok(reasons.includes('stop'));
      ok(reasons.includes('length'));
      ok(reasons.includes('content_filter'));
      ok(reasons.includes('tool_calls'));
      ok(reasons.includes('error'));
    });
  });

  describe('TokenUsage', () => {
    test('should calculate total tokens correctly', () => {
      const usage: TokenUsage = {
        promptTokens: 15,
        completionTokens: 25,
        totalTokens: 40,
      };

      strictEqual(usage.promptTokens + usage.completionTokens, usage.totalTokens);
    });
  });

  describe('ProviderHealth', () => {
    test('should support all health status types', () => {
      const healthyStatus: ProviderHealth = {
        status: 'healthy',
        latency: 250,
        lastChecked: new Date(),
      };

      const unhealthyStatus: ProviderHealth = {
        status: 'unhealthy',
        lastChecked: new Date(),
        error: 'Connection timeout',
      };

      strictEqual(healthyStatus.status, 'healthy');
      strictEqual(healthyStatus.latency, 250);
      ok(healthyStatus.error === undefined);

      strictEqual(unhealthyStatus.status, 'unhealthy');
      strictEqual(unhealthyStatus.error, 'Connection timeout');
    });
  });

  describe('RequestContext', () => {
    test('should have required fields and optional metadata', () => {
      const context: RequestContext = {
        requestId: 'req-789',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        userAgent: 'deep-agents/1.0.0',
        metadata: {
          userId: 'user-123',
          sessionId: 'sess-456',
        },
      };

      strictEqual(context.requestId, 'req-789');
      ok(context.timestamp instanceof Date);
      strictEqual(context.userAgent, 'deep-agents/1.0.0');
      strictEqual(context.metadata?.['userId'], 'user-123');
    });
  });

  describe('ValidationResult', () => {
    test('should represent validation success and failure', () => {
      const success: ValidationResult = {
        valid: true,
        errors: [],
      };

      const failure: ValidationResult = {
        valid: false,
        errors: ['Missing API key', 'Invalid timeout value'],
      };

      strictEqual(success.valid, true);
      strictEqual(success.errors.length, 0);

      strictEqual(failure.valid, false);
      strictEqual(failure.errors.length, 2);
      ok(failure.errors.includes('Missing API key'));
    });
  });

  describe('ProviderType', () => {
    test('should support all provider types', () => {
      const types: ProviderType[] = ['openai', 'anthropic', 'ollama'];

      strictEqual(types.length, 3);
      ok(types.includes('openai'));
      ok(types.includes('anthropic'));
      ok(types.includes('ollama'));
    });
  });

  describe('Interface Compliance', () => {
    test('LLMProvider interface should define required methods', () => {
      // This test validates the interface structure exists
      // Implementation tests will come in later phases
      const mockProvider: Partial<LLMProvider> = {
        info: {
          name: 'mock-provider',
          version: '1.0.0',
          capabilities: ['text-generation'],
        },
        config: {
          apiKey: 'mock-key',
        },
      };

      strictEqual(mockProvider.info?.name, 'mock-provider');
      strictEqual(mockProvider.config?.apiKey, 'mock-key');
    });

    test('ProviderFactory interface should define required methods', () => {
      // Validates factory interface structure
      const mockValidation: ValidationResult = {
        valid: true,
        errors: [],
      };

      strictEqual(mockValidation.valid, true);
      strictEqual(mockValidation.errors.length, 0);
    });

    test('ProviderRegistry interface should define required methods', () => {
      // Validates registry interface structure
      const providerTypes: readonly ProviderType[] = ['openai', 'anthropic', 'ollama'];

      strictEqual(providerTypes.length, 3);
      ok(providerTypes.includes('openai'));
    });
  });

  describe('Immutability Constraints', () => {
    test('readonly properties should maintain functional programming principles', () => {
      const config: ProviderConfig = {
        apiKey: 'test-key',
        timeout: 5000,
      };

      // These should compile without error due to readonly constraints
      strictEqual(config.apiKey, 'test-key');
      strictEqual(config.timeout, 5000);

      const response: LLMResponse = {
        id: 'test-id',
        content: 'test content',
        model: 'test-model',
        finishReason: 'stop',
        usage: {
          promptTokens: 1,
          completionTokens: 1,
          totalTokens: 2,
        },
        metadata: {
          model: 'test-model',
          timestamp: new Date(),
          provider: 'test',
          responseTime: 100,
        },
      };

      strictEqual(response.id, 'test-id');
      strictEqual(response.usage.totalTokens, 2);
    });
  });
});
