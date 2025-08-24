/**
 * Core types and interfaces for the Deep Agent system
 */

/**
 * Base configuration interface
 */
export interface BaseConfig {
  version: string;
  debug?: boolean;
}

/**
 * Agent configuration interface
 */
export interface AgentConfig extends BaseConfig {
  name: string;
  type?: string;
}

/**
 * Task status enumeration
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Basic task interface (will be expanded in Phase 4)
 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  created: number;
  updated: number;
}
