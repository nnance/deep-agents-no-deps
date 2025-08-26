# Requirements Document: HTTP Retry Library for TypeScript/NodeJS

## 1. Overview

### 1.1 Purpose
A lightweight HTTP client library for TypeScript/NodeJS that provides automatic retry functionality with configurable backoff strategies, designed to handle transient failures gracefully without external dependencies.

### 1.2 Design Principles
- **Simplicity**: Minimal API surface with straightforward configuration
- **Zero Dependencies**: Use only Node.js built-in modules (http/https)
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Predictable Behavior**: Clear retry and backoff semantics

## 2. Functional Requirements

### 2.1 HTTP Operations

#### 2.1.1 Supported Methods
- **GET**: Standard GET requests with query parameters
- **POST**: POST requests with body payload
- **PUT**: PUT requests with body payload

#### 2.1.2 Content Type Support
- **JSON**: Automatic serialization/deserialization for `application/json`
- **Text**: Plain text support for `text/plain` and other text-based content types
- **Streaming**: Support for streaming text responses (chunked transfer encoding)

#### 2.1.3 Request Configuration
- Custom headers (key-value pairs)
- Query parameters (automatic URL encoding)
- Request body for POST/PUT operations
- Timeout configuration per request

### 2.2 Retry Logic

#### 2.2.1 Retry Triggers
- HTTP 500 status code (Internal Server Error)
- Request timeouts (connection or read timeout)
- Connection errors (ECONNREFUSED, ECONNRESET, etc.)

#### 2.2.2 Retry Limits
- Configurable maximum retry attempts per request
- Default retry limit if not specified
- Global timeout that caps total time including all retries

#### 2.2.3 Non-Retryable Conditions
- HTTP 4xx status codes (client errors)
- HTTP 501-511 status codes (other server errors)
- Explicit user cancellation

### 2.3 Backoff Strategy

#### 2.3.1 Backoff Algorithm
- Simple exponential backoff: `delay = initialDelay * (multiplier ^ attemptNumber)`
- Optional jitter to prevent thundering herd: `actualDelay = delay * (0.5 + random() * 0.5)`

#### 2.3.2 Backoff Configuration
- Initial delay (milliseconds)
- Multiplier factor
- Maximum delay cap
- Enable/disable jitter

### 2.4 Configuration Hierarchy

Three levels of configuration with precedence order:
1. **Per-Request**: Highest priority, overrides all defaults
2. **Per-Client**: Client instance configuration
3. **Global**: Default configuration for all clients

#### 2.4.1 Configurable Parameters
- Maximum retry attempts
- Request timeout (milliseconds)
- Global timeout (milliseconds)
- Backoff strategy parameters
- Logging verbosity

## 3. API Requirements

### 3.1 Functional API Design

#### 3.1.1 Core Functions
```typescript
// Main request function
request(options: RequestOptions): Promise<Response>

// Method-specific convenience functions
get(url: string, options?: GetOptions): Promise<Response>
post(url: string, body: any, options?: PostOptions): Promise<Response>
put(url: string, body: any, options?: PutOptions): Promise<Response>

// Client factory with instance configuration
createClient(config?: ClientConfig): HttpClient

// Global configuration setter
setGlobalConfig(config: GlobalConfig): void
```

#### 3.1.2 Response Streaming
```typescript
// Stream handler for text responses
requestStream(options: RequestOptions, onChunk: (chunk: string) => void): Promise<void>
```

### 3.2 Type Definitions

#### 3.2.1 Core Types
- `RequestOptions`: Complete request configuration
- `Response`: Response object with status, headers, and body
- `ClientConfig`: Client-level configuration
- `GlobalConfig`: Global configuration
- `BackoffConfig`: Backoff strategy parameters
- `RetryConfig`: Retry behavior configuration

## 4. Non-Functional Requirements

### 4.1 Performance
- Minimal memory footprint
- Efficient connection reuse via Node.js http.Agent
- No unnecessary object allocations during retries

### 4.2 Logging

#### 4.2.1 Integration Requirements
- Integrate with existing project logging library
- Configurable log levels (error, warn, info, debug)
- Option to enable/disable retry attempt logging

#### 4.2.2 Logged Events
- Request initiation (debug level)
- Retry attempts with reason (info/warn level)
- Final failure after all retries (error level)
- Backoff delays (debug level)

### 4.3 Error Handling

#### 4.3.1 Error Types
- `TimeoutError`: Request or global timeout exceeded
- `RetryExhaustedError`: Maximum retries reached
- `HttpError`: Non-retryable HTTP error
- `NetworkError`: Connection-level errors

#### 4.3.2 Error Information
- Original error details
- Number of retry attempts made
- Total elapsed time
- Last HTTP status code (if applicable)

## 5. Constraints

### 5.1 Technology Constraints
- TypeScript 4.0+ compatibility
- Node.js 14+ (LTS version) support
- No external npm dependencies
- Use only built-in Node.js modules (http, https, url, querystring)

### 5.2 Design Constraints
- Stateless design (no persistent connection pools between requests)
- Thread-safe for concurrent requests
- No global state mutations except explicit configuration

## 6. Configuration Schema

### 6.1 Default Values
```typescript
{
  maxRetries: 3,
  requestTimeout: 30000,  // 30 seconds
  globalTimeout: 120000,  // 2 minutes
  backoff: {
    initialDelay: 1000,   // 1 second
    multiplier: 2,
    maxDelay: 30000,      // 30 seconds
    jitter: true
  },
  logging: {
    level: 'info',
    logRetries: true
  }
}
```

## 7. Success Criteria

### 7.1 Acceptance Criteria
- Successfully retries on HTTP 500 errors up to configured limit
- Implements exponential backoff between retry attempts
- Respects both request and global timeout limits
- Properly streams text responses without buffering entire response
- Configuration cascade works correctly (request > client > global)
- Integrates with existing logging library
- All errors contain sufficient debugging information
- Type-safe API with full TypeScript support
- Zero external dependencies in package.json

### 7.2 Test Requirements
- Unit tests for retry logic
- Integration tests with mock HTTP server
- Timeout and cancellation scenario tests
- Configuration precedence tests
- Streaming response tests
- Error propagation tests

---

This requirements document defines a focused, simple HTTP library that handles the essential retry and backoff functionality while maintaining ease of use and implementation. The design prioritizes simplicity and reliability over feature completeness.