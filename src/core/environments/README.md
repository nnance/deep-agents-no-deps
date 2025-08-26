# Environment Management

A dependency-free TypeScript module for loading environment variables from `.env` files into `process.env`. This implementation follows The Twelve-Factor App methodology for configuration management.

## Features

- 🚀 **Zero Dependencies**: Pure TypeScript/Node.js implementation
- 📁 **Flexible File Loading**: Support for custom file paths and encodings
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🔧 **Configurable Options**: Override behavior, debug output, and error handling
- ✅ **Robust Parsing**: Handles quoted values, comments, empty lines, and various formats
- 🧪 **Well Tested**: Comprehensive test suite with edge case coverage
- 🔍 **Error Reporting**: Detailed error messages for parsing and loading issues

## Installation

This module is part of the Deep Agents system. Import it from the core package:

```typescript
import { loadEnv, parseEnv } from '@core/environments';
```

## Basic Usage

### Loading Environment Variables

Create a `.env` file in your project root:

```dosini
NODE_ENV=production
PORT=3000
DB_HOST="localhost"
DB_PASSWORD="secure_password"
API_KEY='your-api-key-here'
DEBUG=true
```

Load the environment variables as early as possible in your application:

```typescript
import { loadEnv } from '@core/environments';

// Load with default options
const result = loadEnv();

if (result.success) {
  console.log(`Loaded ${result.loaded} environment variables`);
  
  // Environment variables are now available in process.env
  console.log(process.env.NODE_ENV); // 'production'
  console.log(process.env.PORT);     // '3000'
} else {
  console.error('Failed to load environment:', result.error);
}
```

### Parsing Environment Content

You can also parse environment variable content directly without loading a file:

```typescript
import { parseEnv } from '@core/environments';

const envContent = `
NODE_ENV=development
PORT=3000
DB_HOST="localhost"
`;

const result = parseEnv(envContent);
console.log(result.parsed); // { NODE_ENV: 'development', PORT: '3000', DB_HOST: 'localhost' }
```

## Configuration Options

The `loadEnv` function accepts an options object:

```typescript
interface LoadEnvOptions {
  path?: string;           // Path to .env file (default: '.env')
  encoding?: BufferEncoding; // File encoding (default: 'utf8')
  debug?: boolean;         // Enable debug logging (default: false)
  override?: boolean;      // Override existing env vars (default: false)
  silent?: boolean;        // Suppress all logs (default: false)
}
```

### Examples

```typescript
// Load from custom path
loadEnv({ path: './config/.env.production' });

// Enable debug output
loadEnv({ debug: true });

// Override existing environment variables
loadEnv({ override: true });

// Silent loading (no console output)
loadEnv({ silent: true });

// Custom encoding
loadEnv({ encoding: 'latin1' });

// Combined options
loadEnv({
  path: './config/.env.local',
  debug: true,
  override: true,
  encoding: 'utf8'
});
```

## File Format

The `.env` file format supports:

- **Key-value pairs**: `KEY=value`
- **Quoted values**: `KEY="quoted value"` or `KEY='single quoted'`
- **Empty values**: `EMPTY_KEY=` or `EMPTY_KEY=""`
- **Comments**: Lines starting with `#`
- **Empty lines**: Blank lines are ignored
- **Special characters**: Values can contain spaces, symbols, etc.

### Example `.env` file:

```dosini
# Application configuration
NODE_ENV=production
PORT=3000

# Database settings
DB_HOST="localhost"
DB_PORT=5432
DB_NAME='my_app_database'
DB_PASSWORD="complex_password_!@#$%"

# API configuration
API_URL="https://api.example.com"
API_KEY=abc123def456

# Feature flags
ENABLE_LOGGING=true
DEBUG_MODE=false

# Optional settings
OPTIONAL_FEATURE=
EMPTY_CONFIG=""
```

## Return Values

### LoadEnvResult

```typescript
interface LoadEnvResult {
  success: boolean;          // Whether the operation succeeded
  loaded: number;           // Number of variables loaded
  error?: string;           // Error message if operation failed
  parsed?: Record<string, string>; // Parsed key-value pairs
}
```

### ParseResult

```typescript
interface ParseResult {
  parsed: Record<string, string>; // Parsed key-value pairs
  errors: string[];               // Any parsing errors encountered
}
```

## Error Handling

The library provides comprehensive error handling:

```typescript
const result = loadEnv();

if (!result.success) {
  switch (true) {
    case result.error?.includes('not found'):
      console.log('Environment file not found - using default values');
      break;
    case result.error?.includes('Permission denied'):
      console.error('Cannot read environment file - check permissions');
      break;
    default:
      console.error('Unexpected error:', result.error);
  }
}
```

## Best Practices

1. **Load Early**: Call `loadEnv()` as early as possible in your application startup
2. **Don't Commit .env**: Add `.env` to your `.gitignore` file
3. **Use .env.example**: Provide a template file with dummy values
4. **Validate Variables**: Check for required environment variables after loading
5. **Type Safety**: Consider creating typed environment variable accessors

### Example Setup

```typescript
// config/env.ts
import { loadEnv } from '@core/environments';

// Load environment variables
const result = loadEnv({ 
  debug: process.env.NODE_ENV !== 'production',
  silent: process.env.NODE_ENV === 'test'
});

if (!result.success) {
  console.error('Failed to load environment variables:', result.error);
  process.exit(1);
}

// Validate required variables
const required = ['NODE_ENV', 'PORT', 'DATABASE_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}

// Export typed environment access
export const env = {
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  PORT: parseInt(process.env.PORT || '3000'),
  DATABASE_URL: process.env.DATABASE_URL!,
  DEBUG: process.env.DEBUG === 'true',
} as const;
```

## Differences from dotenv

This implementation provides similar functionality to the popular `dotenv` package but with some differences:

- **Zero Dependencies**: No external dependencies
- **Better TypeScript Support**: Full type definitions included
- **Enhanced Error Reporting**: More detailed error messages
- **Parse-only Function**: Separate function for parsing content without file I/O
- **Comprehensive Testing**: Extensive test coverage included

## Testing

The module includes comprehensive tests covering:

- Basic parsing functionality
- Error handling scenarios  
- Different file formats and encodings
- Edge cases and malformed input
- Integration testing

Run the tests:

```bash
npm test
```

## License

This module is part of the Deep Agents system and follows the same license terms.
