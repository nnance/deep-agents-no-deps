/**
 * HTTP configuration management
 */

import { GlobalConfig, BackoffConfig, LoggingConfig } from './types.js';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: GlobalConfig = {
  maxRetries: 3,
  requestTimeout: 30000,  // 30 seconds
  globalTimeout: 120000,  // 2 minutes
  backoff: {
    initialDelay: 1000,   // 1 second
    multiplier: 2,
    maxDelay: 30000,      // 30 seconds
    jitter: true
  },
  logging: {
    level: 'info',
    logRetries: true
  }
};

/**
 * Global configuration instance
 */
let globalConfig: GlobalConfig = { ...DEFAULT_CONFIG };

/**
 * Set global configuration
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  globalConfig = {
    ...globalConfig,
    ...config,
    backoff: {
      ...globalConfig.backoff,
      ...config.backoff
    },
    logging: {
      ...globalConfig.logging,
      ...config.logging
    }
  };
}

/**
 * Get current global configuration
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * Reset global configuration to defaults
 */
export function resetGlobalConfig(): void {
  globalConfig = { ...DEFAULT_CONFIG };
}
