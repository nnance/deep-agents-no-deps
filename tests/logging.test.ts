import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { 
  LogLevel, 
  LogFormat, 
  createLogger, 
  ConsoleTransport, 
  FileTransport, 
  HttpTransport,
  DefaultLogFormatter,
  JsonLogFormatter,
  TextLogFormatter
} from '../src/core/logging/index.js';

describe('Logging Library', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('LogFormatter', () => {
    test('DefaultLogFormatter formats text correctly', () => {
      const formatter = new DefaultLogFormatter(LogFormat.Text);
      const result = formatter.format(LogLevel.Info, 'Test message', { key: 'value' });
      
      assert(result.includes('[INFO]'), 'Should include log level');
      assert(result.includes('Test message'), 'Should include message');
      assert(result.includes('"key":"value"'), 'Should include meta data');
      assert(result.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/), 'Should include timestamp');
    });

    test('DefaultLogFormatter formats JSON correctly', () => {
      const formatter = new DefaultLogFormatter(LogFormat.Json);
      const result = formatter.format(LogLevel.Error, 'Error message', { error: 'details' });
      
      const parsed = JSON.parse(result);
      assert.strictEqual(parsed.level, 'error');
      assert.strictEqual(parsed.message, 'Error message');
      assert.deepStrictEqual(parsed.meta, { error: 'details' });
      assert(parsed.timestamp);
    });

    test('JsonLogFormatter always formats as JSON', () => {
      const formatter = new JsonLogFormatter();
      const result = formatter.format(LogLevel.Warn, 'Warning message');
      
      const parsed = JSON.parse(result);
      assert.strictEqual(parsed.level, 'warn');
      assert.strictEqual(parsed.message, 'Warning message');
      assert(parsed.timestamp);
    });

    test('TextLogFormatter always formats as text', () => {
      const formatter = new TextLogFormatter();
      const result = formatter.format(LogLevel.Debug, 'Debug message');
      
      assert(result.includes('[DEBUG]'), 'Should include log level');
      assert(result.includes('Debug message'), 'Should include message');
      assert(!result.startsWith('{'), 'Should not be JSON format');
    });
  });

  describe('ConsoleTransport', () => {
    test('logs messages without throwing', () => {
      const transport = new ConsoleTransport();
      assert.doesNotThrow(() => {
        transport.log(LogLevel.Info, 'Test message');
      });
    });

    test('logs messages with meta data', () => {
      const transport = new ConsoleTransport();
      assert.doesNotThrow(() => {
        transport.log(LogLevel.Error, 'Error message', { code: 500 });
      });
    });
  });

  describe('FileTransport', () => {
    test('creates log file and writes messages', () => {
      const logFile = path.join(tempDir, 'test.log');
      const transport = new FileTransport({ filename: logFile });
      
      transport.log(LogLevel.Info, 'Test message');
      
      assert(fs.existsSync(logFile), 'Log file should be created');
      const content = fs.readFileSync(logFile, 'utf8');
      assert(content.includes('Test message'), 'Log message should be written');
    });

    test('creates directory if it does not exist', () => {
      const logFile = path.join(tempDir, 'nested', 'dir', 'test.log');
      const transport = new FileTransport({ filename: logFile });
      
      transport.log(LogLevel.Info, 'Test message');
      
      assert(fs.existsSync(logFile), 'Log file should be created in nested directory');
    });

    test('appends multiple messages', () => {
      const logFile = path.join(tempDir, 'test.log');
      const transport = new FileTransport({ filename: logFile });
      
      transport.log(LogLevel.Info, 'First message');
      transport.log(LogLevel.Warn, 'Second message');
      
      const content = fs.readFileSync(logFile, 'utf8');
      assert(content.includes('First message'), 'First message should be present');
      assert(content.includes('Second message'), 'Second message should be present');
    });

    test('rotates files when maxSize is exceeded', () => {
      const logFile = path.join(tempDir, 'test.log');
      const transport = new FileTransport({ 
        filename: logFile, 
        maxSize: 100, // Very small size to trigger rotation
        maxFiles: 2 
      });
      
      // Write enough data to trigger rotation
      for (let i = 0; i < 10; i++) {
        transport.log(LogLevel.Info, `Message ${i} with some extra content to make it longer`);
      }
      
      assert(fs.existsSync(logFile), 'Current log file should exist');
      assert(fs.existsSync(`${logFile}.1`), 'Rotated file should exist');
    });
  });

  describe('HttpTransport', () => {
    test('creates without throwing', () => {
      assert.doesNotThrow(() => {
        new HttpTransport({ url: 'http://localhost:3000/logs' });
      });
    });

    test('accepts custom headers and method', () => {
      assert.doesNotThrow(() => {
        new HttpTransport({ 
          url: 'http://localhost:3000/logs',
          method: 'PUT',
          headers: { 'Authorization': 'Bearer token' }
        });
      });
    });
  });

  describe('Logger', () => {
    test('creates logger with basic options', () => {
      const logger = createLogger({
        level: LogLevel.Info,
        format: LogFormat.Text,
        transports: [new ConsoleTransport()]
      });
      
      assert(logger, 'Logger should be created');
      assert.strictEqual(typeof logger.info, 'function', 'Logger should have info method');
      assert.strictEqual(typeof logger.error, 'function', 'Logger should have error method');
      assert.strictEqual(typeof logger.warn, 'function', 'Logger should have warn method');
      assert.strictEqual(typeof logger.debug, 'function', 'Logger should have debug method');
    });

    test('respects log levels', () => {
      const logFile = path.join(tempDir, 'level-test.log');
      const logger = createLogger({
        level: LogLevel.Warn, // Only warn and error should be logged
        format: LogFormat.Text,
        transports: [new FileTransport({ filename: logFile })]
      });
      
      logger.debug('Debug message'); // Should not be logged
      logger.info('Info message');   // Should not be logged
      logger.warn('Warn message');   // Should be logged
      logger.error('Error message'); // Should be logged
      
      const content = fs.readFileSync(logFile, 'utf8');
      assert(!content.includes('Debug message'), 'Debug message should not be logged');
      assert(!content.includes('Info message'), 'Info message should not be logged');
      assert(content.includes('Warn message'), 'Warn message should be logged');
      assert(content.includes('Error message'), 'Error message should be logged');
    });

    test('works with multiple transports', () => {
      const logFile = path.join(tempDir, 'multi-transport.log');
      const logger = createLogger({
        level: LogLevel.Info,
        format: LogFormat.Text,
        transports: [
          new ConsoleTransport(),
          new FileTransport({ filename: logFile })
        ]
      });
      
      logger.info('Multi-transport message');
      
      const content = fs.readFileSync(logFile, 'utf8');
      assert(content.includes('Multi-transport message'), 'Message should be in file');
    });

    test('handles transport errors gracefully', () => {
      // Create a transport that will fail
      const badTransport = {
        log: () => {
          throw new Error('Transport error');
        }
      };
      
      const logger = createLogger({
        level: LogLevel.Info,
        format: LogFormat.Text,
        transports: [badTransport]
      });
      
      // Should not throw even though transport fails
      assert.doesNotThrow(() => {
        logger.info('Test message');
      });
    });

    test('logs with metadata', () => {
      const logFile = path.join(tempDir, 'meta-test.log');
      const logger = createLogger({
        level: LogLevel.Info,
        format: LogFormat.Json,
        transports: [new FileTransport({ filename: logFile })]
      });
      
      logger.info('Message with metadata', { userId: 123, action: 'login' });
      
      const content = fs.readFileSync(logFile, 'utf8');
      const logEntry = JSON.parse(content.trim());
      assert.strictEqual(logEntry.message, 'Message with metadata');
      assert.deepStrictEqual(logEntry.meta, { userId: 123, action: 'login' });
    });
  });

  describe('Integration Tests', () => {
    test('complete logging workflow', () => {
      const logFile = path.join(tempDir, 'integration.log');
      const logger = createLogger({
        level: LogLevel.Debug,
        format: LogFormat.Json,
        transports: [
          new ConsoleTransport({ colorize: false }),
          new FileTransport({ filename: logFile })
        ]
      });
      
      // Log various levels and types
      logger.error('Critical error occurred', { code: 'E001', stack: 'error stack' });
      logger.warn('Warning about deprecated feature');
      logger.info('User logged in', { userId: 123, timestamp: Date.now() });
      logger.debug('Debug information', { query: 'SELECT * FROM users' });
      
      // Verify file content
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');
      
      assert.strictEqual(lines.length, 4, 'Should have 4 log entries');
      
      // Verify each entry is valid JSON
      lines.forEach((line, index) => {
        assert.doesNotThrow(() => JSON.parse(line), `Line ${index} should be valid JSON`);
      });
      
      // Verify specific entries
      const errorEntry = JSON.parse(lines[0]!);
      assert.strictEqual(errorEntry.level, 'error');
      assert.strictEqual(errorEntry.message, 'Critical error occurred');
      assert.strictEqual(errorEntry.meta.code, 'E001');
      
      const infoEntry = JSON.parse(lines[2]!);
      assert.strictEqual(infoEntry.level, 'info');
      assert.strictEqual(infoEntry.message, 'User logged in');
      assert.strictEqual(infoEntry.meta.userId, 123);
    });
  });
});
