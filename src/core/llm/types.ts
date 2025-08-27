/**
 * LLM Provider Core Types
 * 
 * Defines the foundational interfaces and types for the LLM provider system.
 * This follows functional programming principles with immutable data structures
 * and consistent interfaces across all providers.
 */

// Base provider capabilities and identification
export interface ProviderInfo {
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly ProviderCapability[];
}

export type ProviderCapability = 
  | 'text-generation'
  | 'streaming'
  | 'structured-output';

// Configuration interfaces
export interface ProviderConfig {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly timeout?: number;
  readonly retries?: number;
  readonly model?: string;
}

// Generation request and response types
export interface GenerationOptions {
  readonly prompt: string;
  readonly systemMessage?: string;
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly frequencyPenalty?: number;
  readonly presencePenalty?: number;
  readonly stop?: readonly string[];
  readonly seed?: number;
}

export interface LLMResponse {
  readonly id: string;
  readonly content: string;
  readonly model: string;
  readonly finishReason: FinishReason;
  readonly usage: TokenUsage;
  readonly metadata: ResponseMetadata;
}

export type FinishReason = 
  | 'stop'
  | 'length'
  | 'content_filter'
  | 'tool_calls'
  | 'error';

export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface ResponseMetadata {
  readonly requestId?: string;
  readonly model: string;
  readonly timestamp: Date;
  readonly provider: string;
  readonly responseTime: number;
  readonly cached?: boolean;
}

// Core provider interface
export interface LLMProvider {
  readonly info: ProviderInfo;
  readonly config: ProviderConfig;

  generateText(options: GenerationOptions): Promise<LLMResponse>;
  
  // Health check for provider availability
  health(): Promise<ProviderHealth>;
}

export interface ProviderHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly latency?: number;
  readonly lastChecked: Date;
  readonly error?: string;
}

// Request context and tracing
export interface RequestContext {
  readonly requestId: string;
  readonly timestamp: Date;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
}

// Provider factory and registry types
export interface ProviderFactory<T extends ProviderConfig = ProviderConfig> {
  create(config: T): Promise<LLMProvider>;
  validateConfig(config: T): ValidationResult;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export type ProviderType = 'openai' | 'anthropic' | 'ollama';

export interface ProviderRegistry {
  register<T extends ProviderConfig>(
    type: ProviderType, 
    factory: ProviderFactory<T>
  ): void;
  
  create(
    type: ProviderType, 
    config: ProviderConfig
  ): Promise<LLMProvider>;
  
  getProviderTypes(): readonly ProviderType[];
  hasProvider(type: ProviderType): boolean;
}