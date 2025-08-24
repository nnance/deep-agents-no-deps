/**
 * Basic tests for Deep Agent system
 * Using Node.js built-in test runner
 */

import { test, describe } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { DeepAgent, version } from '../src/index';
import { CoreUtils } from '../src/core/index';

describe('Deep Agent System', () => {
  test('should export version', () => {
    strictEqual(version, '0.1.0');
  });

  test('should create Deep Agent instance', () => {
    const agent = new DeepAgent();
    ok(agent instanceof DeepAgent);
  });

  test('should get agent status', () => {
    const agent = new DeepAgent();
    const status = agent.getStatus();
    strictEqual(status, 'Deep Agent initialized - Phase 0 complete');
  });
});

describe('Core Utils', () => {
  test('should get timestamp', () => {
    const timestamp = CoreUtils.getTimestamp();
    ok(typeof timestamp === 'number');
    ok(timestamp > 0);
  });
});
