/**
 * Core module - Foundation components for Deep Agent system
 *
 * This module will contain the foundational components including:
 * - Base agent class
 * - Core utilities
 * - Interfaces and types
 *
 * Implementation will be expanded in Phase 1
 */

/**
 * Core types (placeholder)
 */
export interface AgentConfig {
  name: string;
  version: string;
}

/**
 * Core utilities (placeholder)
 */
export class CoreUtils {
  static getTimestamp(): number {
    return Date.now();
  }
}

// Export all core components
export * from './types';
