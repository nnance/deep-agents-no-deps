/**
 * Core logging types and interfaces
 */

/**
 * Log levels enumeration
 */
export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

/**
 * Log format enumeration
 */
export enum LogFormat {
  Json = 'json',
  Text = 'text',
}

/**
 * Transport interface - all transports must implement this
 */
export interface Transport {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}

/**
 * Logger interface
 */
export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}

/**
 * Logger options interface
 */
export interface LoggerOptions {
  level: LogLevel;
  format: LogFormat;
  transports: Transport[];
}

/**
 * Log formatter interface
 */
export interface LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string;
}

/**
 * Logger provider interface
 */
export interface LoggerProvider {
  createLogger(options: LoggerOptions): Logger;
}

/**
 * File transport options
 */
export interface FileTransportOptions {
  filename: string;
  maxSize?: number;
  maxFiles?: number;
}

/**
 * HTTP transport options
 */
export interface HttpTransportOptions {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
}

/**
 * Console transport options
 */
export interface ConsoleTransportOptions {
  colorize?: boolean;
}
