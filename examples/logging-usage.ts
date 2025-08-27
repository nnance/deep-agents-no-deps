/**
 * Example usage of the logging library
 */

import {
  ConsoleTransport,
  CustomTransport,
  createLogger,
  FileTransport,
  HttpTransport,
  LogFormat,
  LogLevel,
} from '../src/core/logging/index.js';

// Example 1: Basic console logging
console.log('\n=== Basic Console Logging ===');
const basicLogger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Text,
  transports: [new ConsoleTransport({ colorize: true })],
});

basicLogger.info('Application is starting...');
basicLogger.warn('This is a warning message');
basicLogger.error('An error occurred!', { code: 'E001', details: 'Something went wrong' });

// Example 2: File logging with JSON format
console.log('\n=== File Logging with JSON Format ===');
const fileLogger = createLogger({
  level: LogLevel.Debug,
  format: LogFormat.Json,
  transports: [
    new FileTransport({
      filename: 'logs/app.log',
      maxSize: 1024 * 1024, // 1MB
      maxFiles: 5,
    }),
  ],
});

fileLogger.debug('Debug information', { query: 'SELECT * FROM users', duration: 45 });
fileLogger.info('User action', { userId: 123, action: 'login', timestamp: Date.now() });
fileLogger.error('Database connection failed', {
  error: 'Connection timeout',
  host: 'localhost',
  port: 5432,
});

// Example 3: Multiple transports
console.log('\n=== Multiple Transports ===');
const multiLogger = createLogger({
  level: LogLevel.Warn,
  format: LogFormat.Json,
  transports: [
    new ConsoleTransport({ colorize: true }),
    new FileTransport({ filename: 'logs/errors.log' }),
    new HttpTransport({
      url: 'http://localhost:3000/logs',
      headers: { Authorization: 'Bearer your-token' },
    }),
  ],
});

multiLogger.warn('System load is high', { cpu: 85, memory: 78 });
multiLogger.error('Critical system failure', {
  component: 'database',
  severity: 'critical',
  affectedUsers: 1500,
});

// Example 4: Custom transport
console.log('\n=== Custom Transport ===');
class EmailTransport extends CustomTransport {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    // Only send emails for errors
    if (level === LogLevel.Error) {
      const formattedMessage = this.formatMessage(level, message, meta);
      console.log(`[EMAIL SENT] ${formattedMessage}`);
      // In real implementation, this would send an actual email
    }
  }
}

const customLogger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Text,
  transports: [new ConsoleTransport(), new EmailTransport()],
});

customLogger.info('Normal operation'); // Only goes to console
customLogger.error('Critical error!', { urgency: 'high' }); // Goes to console AND email

// Example 5: Different log levels demonstration
console.log('\n=== Log Levels Demonstration ===');
const levelLogger = createLogger({
  level: LogLevel.Warn, // Only warn and error will be logged
  format: LogFormat.Text,
  transports: [new ConsoleTransport()],
});

console.log('Logger configured with WARN level - only warn and error messages will appear:');
levelLogger.debug('This debug message will not appear');
levelLogger.info('This info message will not appear');
levelLogger.warn('This warning message WILL appear');
levelLogger.error('This error message WILL appear');

// Example 6: Structured logging with metadata
console.log('\n=== Structured Logging with Metadata ===');
const structuredLogger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Json,
  transports: [new ConsoleTransport()],
});

// Request logging
structuredLogger.info('HTTP Request', {
  method: 'GET',
  url: '/api/users',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1',
  responseTime: 125,
  statusCode: 200,
});

// Business logic logging
structuredLogger.info('Order processed', {
  orderId: 'ORD-001',
  customerId: 'CUST-123',
  amount: 99.99,
  currency: 'USD',
  paymentMethod: 'credit_card',
  processingTime: 250,
});

// Error logging with context
structuredLogger.error('Payment failed', {
  orderId: 'ORD-002',
  customerId: 'CUST-456',
  amount: 149.99,
  errorCode: 'CARD_DECLINED',
  errorMessage: 'Insufficient funds',
  retryAttempt: 3,
  lastRetry: new Date().toISOString(),
});

console.log('\n=== Logging Examples Complete ===');
console.log('Check the logs/ directory for file output examples.');
