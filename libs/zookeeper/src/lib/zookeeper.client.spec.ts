/**
 * To run these tests, you need a running Zookeeper instance.
 * The easiest way is to use Docker:
 *
 *   docker run --rm -p 2181:2181 zookeeper:3.8
 *
 * This will start Zookeeper on localhost:2181.
 *
 * Make sure to stop the container after testing (Ctrl+C if running in foreground).
 */

import { ZooKeeper } from '@swft-mt/zookeeper';
import { ZookeeperModuleOptions } from './zookeeper-module.options';
import { ZookeeperClient } from './zookeeper.client';
import { ZookeeperConfig } from './zookeeper.config';

function createTestZookeeperConfig(
  opts: ZookeeperModuleOptions,
): ZookeeperConfig {
  const config = new ZookeeperConfig(opts, undefined as any);
  // @ts-expect-error: Accessing private property for test setup
  config.options = opts;
  return config;
}

describe('ZookeeperClient', () => {
  const opts: ZookeeperModuleOptions = {
    host: '127.0.0.1:2181',
    timeout: 5000,
    logLevel: 2,
    hostOrderDeterministic: false,
    retryAttempts: 2,
    retryDelays: 1000,
  };

  let client: ZookeeperClient;

  beforeEach(() => {
    const config = createTestZookeeperConfig(opts);
    client = new ZookeeperClient(config);
  });

  afterEach(() => {
    client.close();
  });

  it('should connect to Zookeeper and emit connect event', async () => {
    const connectPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for connect event'));
      }, 10000);

      client.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    await client.connect();
    await expect(connectPromise).resolves.toBeUndefined();

    // Check internal state
    expect((client as any).connected).toBe(true);
  });
});
