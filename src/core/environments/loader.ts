/**
 * Environment variable loader implementation
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { LoadEnvOptions, LoadEnvResult, ParseResult } from './types';

/**
 * Default options for loading environment variables
 */
const DEFAULT_OPTIONS: Required<LoadEnvOptions> = {
  path: '.env',
  encoding: 'utf8',
  debug: false,
  override: false,
  silent: false,
};

/**
 * Parse environment variable content into key-value pairs
 */
function parseEnvContent(content: string): ParseResult {
  const parsed: Record<string, string> = {};
  const errors: string[] = [];
  
  const lines = content.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';
    const lineNumber = i + 1;
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // Find the first equals sign
    const equalIndex = line.indexOf('=');
    
    if (equalIndex === -1) {
      errors.push(`Line ${lineNumber}: No '=' found`);
      continue;
    }
    
    if (equalIndex === 0) {
      errors.push(`Line ${lineNumber}: Key cannot be empty`);
      continue;
    }
    
    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();
    
    // Handle quoted values
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Validate key format (basic validation)
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      errors.push(`Line ${lineNumber}: Invalid key format "${key}"`);
      continue;
    }
    
    parsed[key] = value;
  }
  
  return { parsed, errors };
}

/**
 * Log debug information about loaded environment variables
 */
function logDebugInfo(parsed: Record<string, string>, silent: boolean): void {
  if (silent) return;
  
  const keys = Object.keys(parsed);
  console.log(`[environments] Loaded ${keys.length} environment variables:`);
  
  keys.forEach(key => {
    // Don't log sensitive values in debug mode
    const value = parsed[key];
    if (value !== undefined) {
      const displayValue = value.length > 20 ? `${value.substring(0, 17)}...` : value;
      console.log(`[environments] ${key}=${displayValue}`);
    }
  });
}

/**
 * Load environment variables from a .env file into process.env
 */
export function loadEnv(options: LoadEnvOptions = {}): LoadEnvResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Resolve the file path
    const filePath = resolve(opts.path);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      const error = `Environment file not found: ${filePath}`;
      if (!opts.silent) {
        console.warn(`[environments] Warning: ${error}`);
      }
      return {
        success: false,
        loaded: 0,
        error,
      };
    }
    
    // Read the file content
    const content = readFileSync(filePath, { encoding: opts.encoding });
    
    // Parse the content
    const { parsed, errors } = parseEnvContent(content);
    
    // Log parsing errors
    if (errors.length > 0 && !opts.silent) {
      console.warn(`[environments] Parsing errors in ${filePath}:`);
      errors.forEach(error => console.warn(`[environments] ${error}`));
    }
    
    // Apply environment variables
    let loaded = 0;
    Object.keys(parsed).forEach(key => {
      if (opts.override || !(key in process.env)) {
        process.env[key] = parsed[key];
        loaded++;
      } else if (opts.debug && !opts.silent) {
        console.log(`[environments] Skipping ${key} (already set)`);
      }
    });
    
    // Log debug information
    if (opts.debug) {
      logDebugInfo(parsed, opts.silent);
    }
    
    if (!opts.silent) {
      console.log(`[environments] Loaded ${loaded} environment variables from ${filePath}`);
    }
    
    return {
      success: true,
      loaded,
      parsed,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (!opts.silent) {
      console.error(`[environments] Error loading environment variables: ${errorMessage}`);
    }
    
    return {
      success: false,
      loaded: 0,
      error: errorMessage,
    };
  }
}

/**
 * Parse environment variables from a string without loading into process.env
 */
export function parseEnv(content: string): ParseResult {
  return parseEnvContent(content);
}
