# HTTP Library

A lightweight HTTP client library for TypeScript/NodeJS that provides automatic retry functionality with configurable backoff strategies, designed to handle transient failures gracefully without external dependencies.

## Features

### Core HTTP Operations
- **GET, POST, PUT methods** - All supported with proper request/response handling
- **JSON and Text content types** - Automatic serialization/deserialization 
- **Query parameters** - Automatic URL encoding
- **Custom headers** - Full support for request headers
- **Streaming responses** - Support for chunked transfer encoding

### Retry Logic  
- **Configurable retry attempts** - Per request, client, or global configuration
- **Exponential backoff** - With configurable initial delay, multiplier, and max delay
- **Jitter support** - Optional randomization to prevent thundering herd
- **Retryable conditions** - HTTP 500 errors, timeouts, network errors
- **Non-retryable conditions** - HTTP 4xx errors, other 5xx errors

### Configuration Management
- **Three-level configuration hierarchy**:
  1. Per-request options (highest priority)  
  2. Global configuration via `setGlobalConfig()` 
  3. Client-instance configuration
- **Runtime configuration updates** - Global config changes affect subsequent requests
- **Sensible defaults** - 3 retries, 30s timeout, exponential backoff

### Error Handling
- **Typed error classes**:
  - `HttpError` - HTTP response errors (4xx, 5xx)
  - `TimeoutError` - Request timeout exceeded  
  - `RetryExhaustedError` - All retries failed
  - `NetworkError` - Connection-level errors
- **Detailed error information** - Status codes, elapsed time, attempt counts

### API Design
- **Functional API** - `get()`, `post()`, `put()`, `request()` functions
- **Client factory** - `createClient()` for configured instances
- **Streaming API** - `requestStream()` for text streaming
- **TypeScript support** - Full type safety with comprehensive interfaces

## 🎯 Key Implementation Highlights

1. **Robust retry logic** - Properly handles attempt counting and configuration precedence
2. **Flexible configuration** - Runtime config updates work correctly with proper precedence  
3. **Comprehensive error handling** - Different error types for different failure modes
4. **Type-safe API** - Full TypeScript support with detailed interfaces
5. **Production-ready** - Handles edge cases, timeouts, and error conditions gracefully

## 📚 Usage Examples

```typescript
import { get, post, setGlobalConfig, createClient } from './core/http';

// Simple usage
const response = await get('https://api.example.com/users');
const data = response.json();

// With retry configuration  
setGlobalConfig({ maxRetries: 5, requestTimeout: 10000 });

// Client with custom config
const client = createClient({ maxRetries: 1, timeout: 5000 });
await client.post('/api/data', { key: 'value' });

// Streaming response
await requestStream(
  { url: '/api/stream', method: 'GET' },
  (chunk) => console.log('Received:', chunk)
);
```

The HTTP library is now complete and fully functional according to all requirements!
