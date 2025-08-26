# Logging Library

A comprehensive, zero-dependency logging library for Node.js applications built with TypeScript. This library provides flexible logging capabilities with support for multiple transports, custom formatting, and log level management.

## Features

- **Multiple Log Levels**: Error, Warn, Info, Debug
- **Multiple Formats**: JSON and Text formatting
- **Multiple Transports**: Console, File, HTTP, and Custom transports
- **Flexible Configuration**: Fine-grained control over logging behavior
- **TypeScript Support**: Full type safety and IntelliSense support
- **Zero Dependencies**: Uses only built-in Node.js modules
- **File Rotation**: Automatic log file rotation based on size and count
- **Error Handling**: Graceful handling of transport errors

## Quick Start

```typescript
import { createLogger, LogLevel, LogFormat, ConsoleTransport } from './core/logging';

const logger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Text,
  transports: [new ConsoleTransport()]
});

logger.info('Application started');
logger.error('Something went wrong', { code: 'E001' });
```

## Log Levels

The library supports four log levels in order of priority:

- `LogLevel.Error` - Critical issues requiring immediate attention
- `LogLevel.Warn` - Potential issues that should be investigated  
- `LogLevel.Info` - General application operation information
- `LogLevel.Debug` - Detailed debugging information

When you set a log level, only messages at that level and higher priority levels will be logged.

## Log Formats

### Text Format
Human-readable format suitable for development and console output:
```
[2024-01-01T00:00:00.000Z] [INFO] Application started {"userId": 123}
```

### JSON Format
Structured format suitable for log aggregation and analysis:
```json
{"timestamp":"2024-01-01T00:00:00.000Z","level":"info","message":"Application started","meta":{"userId":123}}
```

## Transports

### Console Transport
Logs messages to the console with optional colorization:

```typescript
import { ConsoleTransport } from './core/logging';

const transport = new ConsoleTransport({ 
  colorize: true // Enable colors for different log levels
});
```

### File Transport
Writes logs to files with automatic rotation:

```typescript
import { FileTransport } from './core/logging';

const transport = new FileTransport({
  filename: 'logs/app.log',
  maxSize: 1024 * 1024, // 1MB per file
  maxFiles: 5          // Keep 5 rotated files
});
```

### HTTP Transport
Sends logs to a remote server via HTTP:

```typescript
import { HttpTransport } from './core/logging';

const transport = new HttpTransport({
  url: 'https://logs.example.com/api/logs',
  method: 'POST', // Optional, defaults to POST
  headers: {      // Optional custom headers
    'Authorization': 'Bearer token',
    'X-API-Key': 'your-api-key'
  }
});
```

### Custom Transport
Create your own transport by extending the `CustomTransport` class:

```typescript
import { CustomTransport, LogLevel } from './core/logging';

class EmailTransport extends CustomTransport {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (level === LogLevel.Error) {
      const formatted = this.formatMessage(level, message, meta);
      // Send email logic here
      this.sendEmail('admin@company.com', 'Error Alert', formatted);
    }
  }

  private sendEmail(to: string, subject: string, body: string): void {
    // Email implementation
  }
}
```

## Multiple Transports

You can use multiple transports simultaneously:

```typescript
import { createLogger, LogLevel, LogFormat, ConsoleTransport, FileTransport, HttpTransport } from './core/logging';

const logger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Json,
  transports: [
    new ConsoleTransport({ colorize: true }),
    new FileTransport({ filename: 'logs/app.log' }),
    new HttpTransport({ url: 'https://logs.example.com/api/logs' })
  ]
});
```

## Structured Logging with Metadata

Include structured data with your log messages:

```typescript
logger.info('User login', {
  userId: 123,
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  timestamp: Date.now()
});

logger.error('Database error', {
  query: 'SELECT * FROM users WHERE id = ?',
  params: [123],
  error: 'Connection timeout',
  duration: 5000
});
```

## Error Handling

The logging library handles transport errors gracefully. If a transport fails, it won't crash your application:

```typescript
// Even if the HTTP transport fails, console logging will continue
const logger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Text,
  transports: [
    new ConsoleTransport(),
    new HttpTransport({ url: 'https://unreachable-server.com/logs' })
  ]
});

logger.info('This will log to console even if HTTP transport fails');
```

## Advanced Usage

### Custom Formatters

Create custom log formatters by implementing the `LogFormatter` interface:

```typescript
import { LogFormatter, LogLevel } from './core/logging';

class CustomFormatter implements LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toLocaleString();
    return `${timestamp} | ${level.toUpperCase()} | ${message}`;
  }
}
```

### Logger Provider

For dependency injection scenarios, use the logger provider:

```typescript
import { LoggerProvider, DefaultLoggerProvider } from './core/logging';

class MyService {
  private logger: Logger;

  constructor(loggerProvider: LoggerProvider) {
    this.logger = loggerProvider.createLogger({
      level: LogLevel.Info,
      format: LogFormat.Json,
      transports: [new ConsoleTransport()]
    });
  }
}
```

## Performance Considerations

- Log levels are checked before formatting, so disabled log levels have minimal performance impact
- File I/O is synchronous by default for reliability, but this may impact performance in high-throughput scenarios
- HTTP transport is asynchronous and won't block your application
- Consider using appropriate log levels in production (usually Info or Warn)

## Error Transport Resilience

Each transport operates independently. If one transport fails, others continue to work:

```typescript
const logger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Json,
  transports: [
    new ConsoleTransport(),        // Always reliable
    new FileTransport({            // May fail due to disk issues
      filename: '/readonly/app.log'
    }),
    new HttpTransport({            // May fail due to network issues
      url: 'https://external-logs.com/api'
    })
  ]
});

// This log will appear in console even if file and HTTP transports fail
logger.error('Critical error occurred');
```

## Best Practices

1. **Use appropriate log levels**: Debug for development, Info/Warn for production
2. **Include relevant metadata**: Add context that helps with debugging
3. **Avoid logging sensitive data**: Don't log passwords, tokens, or PII
4. **Structure your logs**: Use consistent metadata keys across your application
5. **Monitor log volume**: High-frequency debug logging can impact performance
6. **Use log rotation**: Prevent log files from consuming too much disk space
7. **Centralize configuration**: Create logger instances through a factory or DI container

## Examples

See `examples/logging-usage.ts` for comprehensive usage examples including:
- Basic console logging
- File logging with rotation
- Multiple transports
- Custom transports
- Structured logging
- Error handling

## API Reference

### Core Functions

- `createLogger(options: LoggerOptions): Logger` - Create a new logger instance

### Interfaces

- `Logger` - Main logger interface with error(), warn(), info(), debug() methods
- `LoggerOptions` - Configuration for logger creation
- `Transport` - Interface for implementing custom transports
- `LogFormatter` - Interface for implementing custom formatters

### Enums

- `LogLevel` - Available log levels (Error, Warn, Info, Debug)
- `LogFormat` - Available formats (Json, Text)

### Classes

- `ConsoleTransport` - Logs to console
- `FileTransport` - Logs to files with rotation
- `HttpTransport` - Sends logs via HTTP
- `CustomTransport` - Base class for custom transports
- `DefaultLogFormatter` - Default formatter supporting both JSON and text
- `JsonLogFormatter` - JSON-only formatter
- `TextLogFormatter` - Text-only formatter
