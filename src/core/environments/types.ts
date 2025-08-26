/**
 * Environment management types and interfaces
 */

/**
 * Options for loading environment variables
 */
export interface LoadEnvOptions {
  /**
   * The path to the .env file
   * @default '.env'
   */
  path?: string;

  /**
   * The encoding of the .env file
   * @default 'utf8'
   */
  encoding?: BufferEncoding;

  /**
   * If true, will log the loaded environment variables
   * @default false
   */
  debug?: boolean;

  /**
   * If true, will override existing environment variables
   * @default false
   */
  override?: boolean;

  /**
   * If true, will suppress all logs
   * @default false
   */
  silent?: boolean;
}

/**
 * Result of loading environment variables
 */
export interface LoadEnvResult {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Number of variables loaded
   */
  loaded: number;

  /**
   * Error message if operation failed
   */
  error?: string;

  /**
   * Parsed environment variables
   */
  parsed?: Record<string, string>;
}

/**
 * Environment variable parsing result
 */
export interface ParseResult {
  /**
   * Parsed key-value pairs
   */
  parsed: Record<string, string>;

  /**
   * Any parsing errors encountered
   */
  errors: string[];
}
