import { DefaultLogFormatter } from './formatters.js';
import { BaseTransport } from './transports.js';
import { type Logger, type LoggerOptions, type LoggerProvider, LogLevel } from './types.js';

/**
 * Logger implementation
 */
export class LoggerImpl implements Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions) {
    this.options = options;

    // Configure transports with the logger's format
    this.configureTransports();
  }

  private configureTransports(): void {
    this.options.transports.forEach((transport) => {
      if (transport instanceof BaseTransport) {
        // Update the formatter for BaseTransport instances
        (transport as any).formatter = new DefaultLogFormatter(this.options.format);
      }
    });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.Error, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.Warn, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.Info, message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.Debug, message, meta);
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    // Check if the log level should be logged based on configured level
    if (!this.shouldLog(level)) {
      return;
    }

    // Send to all transports
    this.options.transports.forEach((transport) => {
      try {
        transport.log(level, message, meta);
      } catch (error) {
        // Prevent logging errors from crashing the application
        console.error('Transport error:', error);
      }
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevel.Error]: 0,
      [LogLevel.Warn]: 1,
      [LogLevel.Info]: 2,
      [LogLevel.Debug]: 3,
    };

    return levelPriority[level] <= levelPriority[this.options.level];
  }
}

/**
 * Logger provider implementation
 */
export class DefaultLoggerProvider implements LoggerProvider {
  createLogger(options: LoggerOptions): Logger {
    return new LoggerImpl(options);
  }
}

/**
 * Default logger provider instance
 */
export const loggerProvider = new DefaultLoggerProvider();

/**
 * Factory function to create a logger
 */
export function createLogger(options: LoggerOptions): Logger {
  return loggerProvider.createLogger(options);
}
