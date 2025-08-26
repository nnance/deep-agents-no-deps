import { LogLevel, LogFormat, LogFormatter } from './types.js';

/**
 * Default log formatter implementation
 */
export class DefaultLogFormatter implements LogFormatter {
  constructor(private logFormat: LogFormat = LogFormat.Text) {}

  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    
    if (this.logFormat === LogFormat.Json) {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {})
      });
    }
    
    // Text format
    const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }
}

/**
 * JSON log formatter implementation
 */
export class JsonLogFormatter implements LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {})
    });
  }
}

/**
 * Text log formatter implementation
 */
export class TextLogFormatter implements LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }
}
