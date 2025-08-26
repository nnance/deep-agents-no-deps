# Logger

Logger is designed to be a simple logging library with support for multiple transports. A transport is essentially a storage device for your logs. Each instance of the logger can have multiple transports (see: Transports) configured at different levels (see: Logging levels). For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file.

## Transports

It supports several built-in transports for logging, including:

- Console: Logs messages to the console.
- File: Logs messages to a file.
- HTTP: Sends logs to a remote server via HTTP.
- Custom: Allows you to define your own transport.

Each transport can be configured with its own logging level, format, and other options. This allows for fine-grained control over how and where logs are recorded.

## Logging Levels

Logging levels allow you to categorize your log messages by their importance. Common logging levels include:

- Error: Critical issues that require immediate attention.
- Warn: Potential issues that may not be critical but should be investigated.
- Info: General information about the application's operation.
- Debug: Detailed information useful for debugging purposes.

You can configure each transport to log messages at specific levels, ensuring that only the most relevant information is captured and stored.

## Implementation Details

### Logger Functionality

The primary function for logging is the `createLogger`. It is responsible for managing transports and formatting log messages.

```typescript
enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

enum LogFormat {
  Json = 'json',
  Text = 'text',
}

interface LoggerOptions {
  level: LogLevel;
  format: LogFormat;
  transports: Transport[];
}

interface LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string;
}

interface LoggerProvider {
  createLogger(options: LoggerOptions): Logger;
}
```

### Log Formatter

The Log Formatter is responsible for formatting log messages before they are sent to their respective transports. It ensures a consistent log message structure across different transports.

An example implementation of the LogFormatter class is as follows:

```typescript
class LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaString}`;
  }
}
```

### Transport Interface

Each transport must implement a common interface that defines methods for logging messages at different levels.

```typescript
interface Transport {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}
```

#### Console Transport

The Console Transport logs messages to the console. It is useful for development and debugging purposes.


#### File Transport

The File Transport logs messages to a file. It is useful for persistent log storage.

## Usage

This example demonstrates how to create a logger instance with multiple transports and log messages at different levels. The logger will output messages to both the console and a file, allowing for flexible logging strategies in your application.

```typescript
import { createLogger } from 'your-logging-library';

const logger = createLogger({
  level: LogLevel.Info,
  format: LogFormat.Json,
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filename: 'app.log' }),
  ],
});

logger.info('Application is starting...');
logger.warn('Potential issue detected.');
logger.error('Critical error occurred!');
```
