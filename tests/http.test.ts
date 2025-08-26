/**
 * HTTP library tests
 */

import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as http from 'node:http';
import { AddressInfo } from 'node:net';
import {
  get,
  post,
  put,
  createClient,
  setGlobalConfig,
  HttpError,
  TimeoutError,
  RetryExhaustedError,
  DEFAULT_CONFIG,
  resetGlobalConfig
} from '../src/core/http/index.js';

let server: http.Server;
let baseUrl: string;

// Test server setup
let retryAttempts: Record<string, number> = {};

before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url!, `http://localhost:${(server.address() as AddressInfo).port}`);
    const path = url.pathname;
    const method = req.method;

    // Collect request body
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // Routes for testing
      switch (path) {
        case '/success':
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            message: 'success', 
            method,
            body: body || undefined,
            query: Object.fromEntries(url.searchParams)
          }));
          break;

        case '/error-500':
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          break;

        case '/error-404':
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          break;

        case '/slow':
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('slow response');
          }, 2000);
          break;

        case '/retry-then-success':
          const clientId = req.headers['x-client-id'] as string || 'default';
          if (!retryAttempts[clientId]) {
            retryAttempts[clientId] = 0;
          }
          retryAttempts[clientId]++;
          
          if (retryAttempts[clientId] < 3) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              message: 'success after retries',
              attempts: retryAttempts[clientId]
            }));
            delete retryAttempts[clientId]; // Reset for next test
          }
          break;

        case '/stream':
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.write('chunk1');
          setTimeout(() => {
            res.write('chunk2');
            setTimeout(() => {
              res.write('chunk3');
              res.end();
            }, 100);
          }, 100);
          break;

        default:
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
      }
    });
  });

  return new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('HTTP Library', () => {
  before(() => {
    resetGlobalConfig();
  });

  describe('Basic HTTP Methods', () => {
    it('should make successful GET request', async () => {
      const response = await get(`${baseUrl}/success`);
      assert.strictEqual(response.status, 200);
      
      const data = response.json<any>();
      assert.strictEqual(data.message, 'success');
      assert.strictEqual(data.method, 'GET');
    });

    it('should make successful POST request with JSON body', async () => {
      const body = { test: 'data' };
      const response = await post(`${baseUrl}/success`, body);
      assert.strictEqual(response.status, 200);
      
      const data = response.json<any>();
      assert.strictEqual(data.method, 'POST');
      assert.deepStrictEqual(JSON.parse(data.body), body);
    });

    it('should make successful PUT request', async () => {
      const body = { update: 'data' };
      const response = await put(`${baseUrl}/success`, body);
      assert.strictEqual(response.status, 200);
      
      const data = response.json<any>();
      assert.strictEqual(data.method, 'PUT');
      assert.deepStrictEqual(JSON.parse(data.body), body);
    });

    it('should handle query parameters', async () => {
      const params = { param1: 'value1', param2: 42, param3: true };
      const response = await get(`${baseUrl}/success`, { params });
      
      const data = response.json<any>();
      assert.strictEqual(data.query.param1, 'value1');
      assert.strictEqual(data.query.param2, '42');
      assert.strictEqual(data.query.param3, 'true');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors without retry', async () => {
      try {
        await get(`${baseUrl}/error-404`);
        assert.fail('Expected HttpError to be thrown');
      } catch (error) {
        assert.ok(error instanceof HttpError);
        assert.strictEqual((error as HttpError).status, 404);
        assert.strictEqual((error as HttpError).statusText, 'Not Found');
      }
    });

    it('should handle 500 errors with retry', async () => {
      setGlobalConfig({ 
        maxRetries: 2,
        globalTimeout: 120000  // 2 minutes - should be plenty
      });
      
      try {
        await get(`${baseUrl}/error-500`);
        assert.fail('Expected RetryExhaustedError to be thrown');
      } catch (error) {
        assert.ok(error instanceof RetryExhaustedError);
        // For maxRetries: 2, we should have 1 initial + 2 retries = 3 attempts
        assert.strictEqual((error as RetryExhaustedError).attempts, 3);
      }
    });

    it('should handle timeouts', async () => {
      try {
        await get(`${baseUrl}/slow`, { timeout: 500 });
        assert.fail('Expected RetryExhaustedError to be thrown');
      } catch (error) {
        // Timeouts are retryable, so after exhausting retries we should get RetryExhaustedError
        assert.ok(error instanceof RetryExhaustedError);
        // The original error should be a TimeoutError
        assert.ok((error as RetryExhaustedError).lastError instanceof TimeoutError);
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry and eventually succeed', async () => {
      setGlobalConfig({ 
        maxRetries: 3,
        backoff: { 
          initialDelay: 100, 
          multiplier: 1.5, 
          maxDelay: 1000, 
          jitter: false 
        } 
      });

      const clientId = `test-${Date.now()}`;
      const response = await get(`${baseUrl}/retry-then-success`, {
        headers: { 'x-client-id': clientId }
      });
      assert.strictEqual(response.status, 200);
      
      const data = response.json<any>();
      assert.strictEqual(data.message, 'success after retries');
      assert.strictEqual(data.attempts, 3);
    });
  });

  describe('Client Configuration', () => {
    it('should create client with custom configuration', async () => {
      const client = createClient({
        maxRetries: 1,
        requestTimeout: 5000
      });

      const response = await client.get(`${baseUrl}/success`);
      assert.strictEqual(response.status, 200);
    });

    it('should override global config with request config', async () => {
      setGlobalConfig({ maxRetries: 5 });
      
      try {
        await get(`${baseUrl}/error-500`, { maxRetries: 1 });
        assert.fail('Expected RetryExhaustedError to be thrown');
      } catch (error) {
        assert.ok(error instanceof RetryExhaustedError);
        assert.strictEqual((error as RetryExhaustedError).attempts, 2); // initial + 1 retry
      }
    });
  });

  describe('Response Handling', () => {
    it('should handle JSON responses', async () => {
      const response = await get(`${baseUrl}/success`);
      const json = response.json<any>();
      assert.strictEqual(typeof json, 'object');
      assert.strictEqual(json.message, 'success');
    });

    it('should handle text responses', async () => {
      try {
        const response = await get(`${baseUrl}/error-404`);
        // This should not happen, but if it does, test the text method
        const text = response.text();
        assert.strictEqual(text, 'Not Found');
      } catch (error) {
        // For 404 errors, we should get HttpError with text body
        assert.ok(error instanceof HttpError);
        const httpError = error as HttpError;
        assert.strictEqual(httpError.status, 404);
        assert.strictEqual(httpError.body, 'Not Found');
      }
    });
  });
});
