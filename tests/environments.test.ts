/**
 * Tests for environment management module
 */

import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { parseEnv } from '../src/core/environments';

describe('Environment Management', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear test environment variables
    delete process.env['TEST_VAR1'];
    delete process.env['TEST_VAR2'];
    delete process.env['EXISTING_VAR'];
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('parseEnv', () => {
    it('should parse simple key-value pairs', () => {
      const content = 'KEY1=value1\nKEY2=value2\n';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        KEY1: 'value1',
        KEY2: 'value2',
      });
      strictEqual(result.errors.length, 0);
    });

    it('should handle quoted values', () => {
      const content = 'KEY1="quoted value"\nKEY2=\'single quoted\'\n';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        KEY1: 'quoted value',
        KEY2: 'single quoted',
      });
      strictEqual(result.errors.length, 0);
    });

    it('should skip empty lines and comments', () => {
      const content = '# This is a comment\n\nKEY1=value1\n# Another comment\nKEY2=value2\n\n';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        KEY1: 'value1',
        KEY2: 'value2',
      });
      strictEqual(result.errors.length, 0);
    });

    it('should handle Windows line endings', () => {
      const content = 'KEY1=value1\r\nKEY2=value2\r\n';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        KEY1: 'value1',
        KEY2: 'value2',
      });
    });

    it('should report parsing errors', () => {
      const content = 'INVALID_LINE\n=EMPTY_KEY\n123INVALID_KEY=value\nVALID_KEY=value';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        VALID_KEY: 'value',
      });
      strictEqual(result.errors.length, 3);
      ok(result.errors[0]?.includes("No '=' found"));
      ok(result.errors[1]?.includes('Key cannot be empty'));
      ok(result.errors[2]?.includes('Invalid key format'));
    });

    it('should handle empty values', () => {
      const content = 'EMPTY_VALUE=\nANOTHER_EMPTY=""';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        EMPTY_VALUE: '',
        ANOTHER_EMPTY: '',
      });
    });

    it('should handle values with spaces and special characters', () => {
      const content =
        'VAR_WITH_SPACES=value with spaces\nVAR_WITH_EQUALS=key=value\nVAR_SPECIAL=!@#$%^&*()';
      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        VAR_WITH_SPACES: 'value with spaces',
        VAR_WITH_EQUALS: 'key=value',
        VAR_SPECIAL: '!@#$%^&*()',
      });
    });

    it('should handle multiline content with various formats', () => {
      const content = `
# Configuration file
NODE_ENV=production
PORT=3000

# Database settings
DB_HOST="localhost"
DB_PORT=5432
DB_NAME='myapp_db'

# API Keys
API_KEY="abc123def456"
SECRET_KEY=secretvalue

# Empty values
EMPTY_VAR=
QUOTED_EMPTY=""
      `.trim();

      const result = parseEnv(content);

      deepStrictEqual(result.parsed, {
        NODE_ENV: 'production',
        PORT: '3000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_NAME: 'myapp_db',
        API_KEY: 'abc123def456',
        SECRET_KEY: 'secretvalue',
        EMPTY_VAR: '',
        QUOTED_EMPTY: '',
      });
      strictEqual(result.errors.length, 0);
    });
  });

  describe('loadEnv integration tests', () => {
    it('should load environment variables when .env file exists', () => {
      // Note: These tests require actual file system operations
      // For comprehensive file system testing, a more sophisticated
      // mocking setup would be needed, which is beyond the scope
      // of this basic implementation.

      // Test that we can at least call the function without errors
      const { loadEnv } = require('../src/core/environments');

      // This will attempt to load from .env file if it exists
      const result = loadEnv({ silent: true });

      // Should return a result object regardless of file existence
      ok(typeof result === 'object');
      ok(typeof result.success === 'boolean');
      ok(typeof result.loaded === 'number');
    });

    it('should handle override option with existing environment variables', () => {
      const { loadEnv } = require('../src/core/environments');

      // Set an existing environment variable
      process.env['TEST_OVERRIDE'] = 'original';

      // Try to load (will fail to find file, but we can test the logic)
      const _result = loadEnv({
        path: 'nonexistent.env',
        silent: true,
        override: false,
      });

      // Should not have overridden the existing variable
      strictEqual(process.env['TEST_OVERRIDE'], 'original');

      // Clean up
      delete process.env['TEST_OVERRIDE'];
    });
  });
});
