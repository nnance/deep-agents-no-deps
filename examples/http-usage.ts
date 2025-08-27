/**
 * HTTP Library Usage Examples
 */

import {
  createClient,
  get,
  HttpError,
  post,
  put,
  RetryExhaustedError,
  request,
  requestStream,
  setGlobalConfig,
  TimeoutError,
} from '../src/core/http/index.js';

async function basicUsageExamples() {
  console.log('=== Basic HTTP Usage Examples ===\n');

  try {
    // Simple GET request
    console.log('1. Making a simple GET request...');
    const getResponse = await get('https://httpbin.org/get', {
      params: { key1: 'value1', key2: 42 },
    });
    console.log('Status:', getResponse.status);
    console.log('Response:', getResponse.json());
    console.log();

    // POST request with JSON body
    console.log('2. Making a POST request with JSON body...');
    const postData = { name: 'John Doe', email: 'john@example.com' };
    const postResponse = await post('https://httpbin.org/post', postData, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Status:', postResponse.status);
    const postResult = postResponse.json<any>();
    console.log('Echo back:', postResult.json);
    console.log();

    // PUT request
    console.log('3. Making a PUT request...');
    const putData = { id: 123, name: 'Updated Name' };
    const putResponse = await put('https://httpbin.org/put', putData);
    console.log('Status:', putResponse.status);
    console.log();

    // Generic request with custom options
    console.log('4. Making a generic request with custom options...');
    const customResponse = await request({
      url: 'https://httpbin.org/headers',
      method: 'GET',
      headers: {
        'User-Agent': 'Deep-Agents-HTTP-Client/1.0',
        'Custom-Header': 'test-value',
      },
      timeout: 10000,
    });
    console.log('Status:', customResponse.status);
    console.log();
  } catch (error) {
    console.error('Error in basic examples:', error);
  }
}

async function retryAndErrorHandlingExamples() {
  console.log('=== Retry and Error Handling Examples ===\n');

  // Configure global retry settings
  setGlobalConfig({
    maxRetries: 3,
    backoff: {
      initialDelay: 1000,
      multiplier: 2,
      maxDelay: 10000,
      jitter: true,
    },
    logging: {
      level: 'info',
      logRetries: true,
    },
  });

  try {
    // Example with timeout
    console.log('1. Testing timeout handling...');
    await get('https://httpbin.org/delay/10', {
      timeout: 2000, // 2 second timeout
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.log('✓ Timeout error caught successfully');
      console.log('Timeout:', error.timeout, 'Elapsed:', error.elapsedTime);
    }
  }
  console.log();

  try {
    // Example with non-retryable error (404)
    console.log('2. Testing 404 error (non-retryable)...');
    await get('https://httpbin.org/status/404');
  } catch (error) {
    if (error instanceof HttpError) {
      console.log('✓ HTTP error caught successfully');
      console.log('Status:', error.status, 'Message:', error.message);
    }
  }
  console.log();

  try {
    // Example that would trigger retries (500 error)
    console.log('3. Testing 500 error with retries...');
    await get('https://httpbin.org/status/500', {
      maxRetries: 2, // Override global setting for this request
    });
  } catch (error) {
    if (error instanceof RetryExhaustedError) {
      console.log('✓ Retry exhausted error caught successfully');
      console.log('Attempts:', error.attempts, 'Elapsed time:', error.elapsedTime);
    }
  }
  console.log();
}

async function clientConfigurationExamples() {
  console.log('=== Client Configuration Examples ===\n');

  // Create a client with custom configuration
  const apiClient = createClient({
    maxRetries: 5,
    requestTimeout: 15000,
    backoff: {
      initialDelay: 500,
      multiplier: 1.5,
      maxDelay: 5000,
      jitter: false,
    },
    headers: {
      Authorization: 'Bearer fake-token',
      'User-Agent': 'MyApp/1.0',
    },
    logging: {
      level: 'debug',
      logRetries: true,
    },
  });

  try {
    console.log('1. Using configured client...');
    const response = await apiClient.get('https://httpbin.org/headers');
    console.log('Status:', response.status);
    const data = response.json<any>();
    console.log('Headers sent:', data.headers);
    console.log();

    console.log('2. Client with different configuration...');
    const fastClient = createClient({
      maxRetries: 1,
      requestTimeout: 5000,
    });

    const fastResponse = await fastClient.get('https://httpbin.org/get');
    console.log('Fast client response status:', fastResponse.status);
    console.log();
  } catch (error) {
    console.error('Error in client examples:', error);
  }
}

async function streamingExample() {
  console.log('=== Streaming Response Example ===\n');

  try {
    console.log('1. Streaming text response...');
    const chunks: string[] = [];

    await requestStream(
      {
        url: 'https://httpbin.org/stream/5',
        method: 'GET',
      },
      (chunk: string) => {
        console.log('Received chunk:', chunk.trim());
        chunks.push(chunk);
      }
    );

    console.log(`✓ Streaming completed. Received ${chunks.length} chunks.`);
    console.log();
  } catch (error) {
    console.error('Error in streaming example:', error);
  }
}

async function advancedUsageExamples() {
  console.log('=== Advanced Usage Examples ===\n');

  try {
    // Example with multiple retry configurations for different endpoints
    console.log('1. Different retry strategies for different endpoints...');

    // Critical API - more retries
    const _criticalClient = createClient({
      maxRetries: 5,
      backoff: {
        initialDelay: 2000,
        multiplier: 2,
        maxDelay: 30000,
        jitter: true,
      },
    });

    // Fast API - fewer retries
    const _fastClient = createClient({
      maxRetries: 1,
      requestTimeout: 3000,
      backoff: {
        initialDelay: 500,
        multiplier: 1.5,
        maxDelay: 2000,
        jitter: false,
      },
    });

    console.log('✓ Clients configured with different strategies');
    console.log();

    // Example with complex request
    console.log('2. Complex request with multiple parameters...');
    const complexResponse = await request({
      url: 'https://httpbin.org/anything',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Custom-Header': 'custom-value',
      },
      params: {
        filter: 'active',
        sort: 'created_date',
        limit: 50,
      },
      body: {
        data: {
          items: [1, 2, 3],
          metadata: {
            source: 'deep-agents',
            version: '1.0',
          },
        },
      },
      timeout: 8000,
      maxRetries: 3,
    });

    console.log('Complex request status:', complexResponse.status);
    const complexData = complexResponse.json<any>();
    console.log('Request echo - method:', complexData.method);
    console.log('Request echo - URL:', complexData.url);
    console.log();
  } catch (error) {
    console.error('Error in advanced examples:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('Deep Agents HTTP Library Examples\n');
  console.log('==================================\n');

  await basicUsageExamples();
  await retryAndErrorHandlingExamples();
  await clientConfigurationExamples();
  await streamingExample();
  await advancedUsageExamples();

  console.log('=== All Examples Completed ===');
}

// Run examples if this file is executed directly
// Note: In a real application, you would check process.argv or use a proper CLI framework
runAllExamples().catch(console.error);

export {
  basicUsageExamples,
  retryAndErrorHandlingExamples,
  clientConfigurationExamples,
  streamingExample,
  advancedUsageExamples,
  runAllExamples,
};
