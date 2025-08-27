import * as fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import * as path from 'node:path';
import { DefaultLogFormatter } from './formatters.js';
import {
  type ConsoleTransportOptions,
  type FileTransportOptions,
  type HttpTransportOptions,
  LogFormat,
  LogLevel,
  type Transport,
} from './types.js';

/**
 * Base transport class that handles formatting
 */
export abstract class BaseTransport implements Transport {
  protected formatter: DefaultLogFormatter;

  constructor(format: LogFormat = LogFormat.Text) {
    this.formatter = new DefaultLogFormatter(format);
  }

  abstract log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;

  protected formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): string {
    return this.formatter.format(level, message, meta);
  }
}

/**
 * Console transport implementation
 */
export class ConsoleTransport extends BaseTransport {
  private colorize: boolean;

  constructor(options: ConsoleTransportOptions = {}, format: LogFormat = LogFormat.Text) {
    super(format);
    this.colorize = options.colorize ?? true;
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const formattedMessage = this.formatMessage(level, message, meta);

    if (this.colorize) {
      const coloredMessage = this.colorizeMessage(level, formattedMessage);
      console.log(coloredMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  private colorizeMessage(level: LogLevel, message: string): string {
    const colors = {
      [LogLevel.Error]: '\x1b[31m', // Red
      [LogLevel.Warn]: '\x1b[33m', // Yellow
      [LogLevel.Info]: '\x1b[36m', // Cyan
      [LogLevel.Debug]: '\x1b[37m', // White
    };
    const reset = '\x1b[0m';
    return `${colors[level] || ''}${message}${reset}`;
  }
}

/**
 * File transport implementation
 */
export class FileTransport extends BaseTransport {
  private filename: string;
  private maxSize: number | undefined;
  private maxFiles: number | undefined;

  constructor(options: FileTransportOptions, format: LogFormat = LogFormat.Text) {
    super(format);
    this.filename = options.filename;
    this.maxSize = options.maxSize;
    this.maxFiles = options.maxFiles;

    // Ensure directory exists
    const dir = path.dirname(this.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const formattedMessage = this.formatMessage(level, message, meta);

    try {
      // Check file size and rotate if necessary
      if (this.maxSize && fs.existsSync(this.filename)) {
        const stats = fs.statSync(this.filename);
        if (stats.size >= this.maxSize) {
          this.rotateFile();
        }
      }

      fs.appendFileSync(this.filename, `${formattedMessage}\n`);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateFile(): void {
    if (!this.maxFiles) return;

    try {
      // Rotate existing files
      for (let i = this.maxFiles - 1; i > 0; i--) {
        const currentFile = `${this.filename}.${i}`;
        const nextFile = `${this.filename}.${i + 1}`;

        if (fs.existsSync(currentFile)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(currentFile); // Delete the oldest file
          } else {
            fs.renameSync(currentFile, nextFile);
          }
        }
      }

      // Move current file to .1
      if (fs.existsSync(this.filename)) {
        fs.renameSync(this.filename, `${this.filename}.1`);
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }
}

/**
 * HTTP transport implementation
 */
export class HttpTransport extends BaseTransport {
  private url: string;
  private method: 'POST' | 'PUT';
  private headers: Record<string, string>;

  constructor(options: HttpTransportOptions, format: LogFormat = LogFormat.Json) {
    super(format);
    this.url = options.url;
    this.method = options.method ?? 'POST';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    };

    const postData = JSON.stringify(logData);
    const urlObj = new URL(this.url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: this.method,
      headers: {
        ...this.headers,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = httpModule.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        console.error(`HTTP transport error: ${res.statusCode} ${res.statusMessage}`);
      }
    });

    req.on('error', (error) => {
      console.error('HTTP transport error:', error);
    });

    req.write(postData);
    req.end();
  }
}

/**
 * Custom transport base class
 */
export abstract class CustomTransport extends BaseTransport {
  constructor(format: LogFormat = LogFormat.Text) {
    super(format);
  }

  abstract override log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}
