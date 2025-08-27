/**
 * Example usage of the environment management library
 */

import { loadEnv, parseEnv } from '../src/core/environments';

console.log('Environment Management Example');
console.log('==============================\n');

// Example 1: Basic usage - Load from .env file
console.log('1. Loading environment variables from .env file:');
const result = loadEnv({
  debug: true,
  silent: false,
});

if (result.success) {
  console.log(`✅ Successfully loaded ${result.loaded} variables\n`);
} else {
  console.log(`❌ Failed to load environment variables: ${result.error}\n`);
}

// Example 2: Parse environment content directly
console.log('2. Parsing environment content directly:');
const envContent = `
# Example .env content
NODE_ENV=development
PORT=3000
DB_HOST="localhost"
DB_PORT=5432
API_KEY="your-api-key-here"
DEBUG=true
EMPTY_VALUE=
`;

const parseResult = parseEnv(envContent);
console.log('Parsed variables:', parseResult.parsed);
if (parseResult.errors.length > 0) {
  console.log('Parsing errors:', parseResult.errors);
}
console.log();

// Example 3: Load with custom options
console.log('3. Loading with custom options:');
const customResult = loadEnv({
  path: './config/.env.example', // Custom path
  override: true, // Override existing variables
  debug: true, // Show debug information
  encoding: 'utf8', // File encoding
  silent: false, // Don't suppress logs
});

if (customResult.success) {
  console.log(`✅ Custom load successful: ${customResult.loaded} variables loaded`);
} else {
  console.log(`❌ Custom load failed: ${customResult.error}`);
}
console.log();

// Example 4: Demonstrate error handling
console.log('4. Error handling example:');
const errorResult = loadEnv({
  path: './non-existent-file.env',
  silent: false,
});

if (!errorResult.success) {
  console.log(`Expected error handled gracefully: ${errorResult.error}`);
}
console.log();

// Example 5: Show current environment variables that might have been loaded
console.log('5. Sample environment variables (if any were loaded):');
const sampleVars = ['NODE_ENV', 'PORT', 'DB_HOST', 'API_KEY', 'DEBUG'];
sampleVars.forEach((varName) => {
  const value = process.env[varName];
  if (value !== undefined) {
    // Don't log sensitive values completely
    const displayValue =
      varName.toLowerCase().includes('key') || varName.toLowerCase().includes('secret')
        ? '***HIDDEN***'
        : value;
    console.log(`  ${varName}=${displayValue}`);
  }
});

console.log('\n✨ Environment management example completed!');
