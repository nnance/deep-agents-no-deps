/**
 * HTTP module main interface and convenience functions
 */

import { HttpClient } from './client.js';
import { getGlobalConfig, setGlobalConfig as setConfig } from './config.js';
import type {
  ClientConfig,
  GetOptions,
  GlobalConfig,
  HttpClient as IHttpClient,
  PostOptions,
  PutOptions,
  RequestOptions,
  Response,
} from './types.js';

/**
 * Default HTTP client instance
 */
const defaultClient = new HttpClient();

/**
 * Make a GET request
 */
export async function get(url: string, options?: GetOptions): Promise<Response> {
  const requestOptions: RequestOptions = {
    url,
    method: 'GET',
    ...options,
  };
  return defaultClient.request(requestOptions);
}

/**
 * Make a POST request
 */
export async function post(url: string, body: unknown, options?: PostOptions): Promise<Response> {
  const requestOptions: RequestOptions = {
    url,
    method: 'POST',
    body,
    ...options,
  };
  return defaultClient.request(requestOptions);
}

/**
 * Make a PUT request
 */
export async function put(url: string, body: unknown, options?: PutOptions): Promise<Response> {
  const requestOptions: RequestOptions = {
    url,
    method: 'PUT',
    body,
    ...options,
  };
  return defaultClient.request(requestOptions);
}

/**
 * Make a generic HTTP request
 */
export async function request(options: RequestOptions): Promise<Response> {
  return defaultClient.request(options);
}

/**
 * Make a streaming HTTP request
 */
export async function requestStream(
  options: RequestOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  return defaultClient.requestStream(options, onChunk);
}

/**
 * Create a new HTTP client with specific configuration
 */
export function createClient(config?: ClientConfig): IHttpClient {
  const client = new HttpClient(config);

  return {
    async get(url: string, options?: GetOptions): Promise<Response> {
      const requestOptions: RequestOptions = {
        url,
        method: 'GET',
        ...options,
      };
      return client.request(requestOptions);
    },

    async post(url: string, body: unknown, options?: PostOptions): Promise<Response> {
      const requestOptions: RequestOptions = {
        url,
        method: 'POST',
        body,
        ...options,
      };
      return client.request(requestOptions);
    },

    async put(url: string, body: unknown, options?: PutOptions): Promise<Response> {
      const requestOptions: RequestOptions = {
        url,
        method: 'PUT',
        body,
        ...options,
      };
      return client.request(requestOptions);
    },

    async request(options: RequestOptions): Promise<Response> {
      return client.request(options);
    },

    async requestStream(options: RequestOptions, onChunk: (chunk: string) => void): Promise<void> {
      return client.requestStream(options, onChunk);
    },
  };
}

/**
 * Set global HTTP configuration
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  setConfig(config);
}

/**
 * Get current global configuration
 */
export function getGlobalHttpConfig(): GlobalConfig {
  return getGlobalConfig();
}
