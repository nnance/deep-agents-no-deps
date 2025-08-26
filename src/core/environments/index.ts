/**
 * Environment management module
 * 
 * A dependency-free module that loads environment variables from a .env file
 * into process.env. Storing configuration in the environment separate from code
 * is based on The Twelve-Factor App methodology.
 * 
 * @example
 * ```typescript
 * import { loadEnv } from '@core/environments';
 * 
 * // Load environment variables from .env file
 * const result = loadEnv();
 * 
 * if (result.success) {
 *   console.log(`Loaded ${result.loaded} environment variables`);
 * }
 * ```
 */

export * from './types';
export * from './loader';
