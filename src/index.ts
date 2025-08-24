/**
 * Deep Agents - A TypeScript-based Node.js package implementing a Deep Agent system
 * 
 * This is the main entry point for the Deep Agents library.
 * It provides planning, sub-agents, file system access, and memory management capabilities.
 * 
 * @version 0.1.0
 */

/**
 * Deep Agent System Version
 */
export const version = '0.1.0';

/**
 * Main Deep Agent class (placeholder for Phase 1+)
 */
export class DeepAgent {
  constructor() {
    // Implementation will be added in Phase 1
  }

  /**
   * Get agent status
   */
  getStatus(): string {
    return 'Deep Agent initialized - Phase 0 complete';
  }
}

// Export main components (will be expanded in later phases)
export * from './core/index';

// Default export
export default DeepAgent;
