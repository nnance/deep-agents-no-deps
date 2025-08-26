/**
 * HTTP response implementation
 */

import { IncomingHttpHeaders } from 'http';
import { Response } from './types.js';

/**
 * HTTP Response implementation
 */
export class ResponseImpl implements Response {
  private _body: string;

  constructor(
    public status: number,
    public statusText: string,
    public headers: IncomingHttpHeaders,
    body: string | Buffer
  ) {
    this._body = body.toString();
  }

  get body(): unknown {
    return this._body;
  }

  text(): string {
    return this._body;
  }

  json<T = unknown>(): T {
    try {
      return JSON.parse(this._body) as T;
    } catch (error) {
      throw new Error(`Failed to parse response as JSON: ${error}`);
    }
  }
}
