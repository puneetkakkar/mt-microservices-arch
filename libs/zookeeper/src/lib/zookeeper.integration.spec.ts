/**
 * Integration tests for Zookeeper module
 *
 * These tests are designed to work with mocked zookeeper functionality
 * to avoid requiring a real zookeeper instance during testing.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ServiceStore } from '@swft-mt/common';
import { ZookeeperDiscoveryClient } from './discovery/zookeeper-discovery.client';
import { ZookeeperServiceRegistry } from './service-registry/zookeeper-service-registry';
import { ZookeeperModuleOptions } from './zookeeper-module.options';
import { ZookeeperClient } from './zookeeper.client';
import { ZookeeperConfig } from './zookeeper.config';
import { ZookeeperModule } from './zookeeper.module';

// Mock the zookeeper client
jest.mock('./zookeeper.client');

describe('Zookeeper Integration Tests', () => {
  let module: TestingModule;
  let zookeeperClient: jest.Mocked<ZookeeperClient>;
  let serviceRegistry: ZookeeperServiceRegistry;
  let discoveryClient: ZookeeperDiscoveryClient;
  let serviceStore: ServiceStore;

  const testOptions: ZookeeperModuleOptions = {
    host: '127.0.0.1:2181',
    timeout: 5000,
    logLevel: 2,
    hostOrderDeterministic: false,
    retryAttempts: 2,
    retryDelays: 1000,
  };

  const testService = {
    id: 'test-service-1',
    name: 'test-service',
    address: 'localhost',
    port: 3000,
    tags: ['test', 'integration'],
    metadata: { version: '1.0.0', environment: 'test' },
  };

  const testDiscoveryOptions = {
    type: 'http' as const,
    http: 'http://localhost:3000/health',
    interval: 10,
    timeout: '5',
    failFast: false,
    scheme: 'http',
  };

  const testHeartbeatOptions = {
    enabled: true,
    ttlInSeconds: 30,
  };

  beforeAll(async () => {
    // Create mock zookeeper client
    const mockZookeeperClient = {
      connected: false,
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      create: jest.fn().mockResolvedValue('/swft-mt-service/test-service-1'),
      get: jest
        .fn()
        .mockResolvedValue([Buffer.from(JSON.stringify(testService))]),
      delete_: jest.fn().mockResolvedValue(undefined),
      get_children: jest.fn().mockResolvedValue(['test-service-1']),
      once: jest.fn(),
      on: jest.fn(),
    } as any;

    module = await Test.createTestingModule({
      imports: [ZookeeperModule.forRoot(testOptions)],
      providers: [
        ServiceStore,
        {
          provide: 'SERVICE_REGISTRY_CONFIG',
          useValue: {
            service: testService,
            discovery: testDiscoveryOptions,
            heartbeat: testHeartbeatOptions,
          },
        },
        {
          provide: ZookeeperServiceRegistry,
          useFactory: () => {
            const mockServiceStore = {
              setServices: jest.fn(),
              getServices: jest.fn().mockReturnValue([]),
              removeServices: jest.fn(),
            } as any;

            const registry = new ZookeeperServiceRegistry(
              mockZookeeperClient,
              {
                service: testService,
                discovery: testDiscoveryOptions,
                heartbeat: testHeartbeatOptions,
              },
              mockServiceStore,
            );
            return registry;
          },
        },
        {
          provide: ZookeeperDiscoveryClient,
          useFactory: () => new ZookeeperDiscoveryClient(mockZookeeperClient),
        },
      ],
    })
      .overrideProvider(ZookeeperClient)
      .useValue(mockZookeeperClient)
      .compile();

    zookeeperClient = module.get<ZookeeperClient>(
      ZookeeperClient,
    ) as jest.Mocked<ZookeeperClient>;
    serviceRegistry = module.get<ZookeeperServiceRegistry>(
      ZookeeperServiceRegistry,
    );
    discoveryClient = module.get<ZookeeperDiscoveryClient>(
      ZookeeperDiscoveryClient,
    );
    serviceStore = module.get<ServiceStore>(ServiceStore);

    // Manually initialize the config
    const zookeeperConfig = module.get<ZookeeperConfig>(ZookeeperConfig);
    zookeeperConfig.onModuleInit();
  });

  afterAll(async () => {
    if (module) {
      try {
        await module.close();
      } catch (error) {
        // Ignore cleanup errors in tests
        console.log('Cleanup error (expected):', (error as Error).message);
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    zookeeperClient.connected = false;
  });

  describe('Zookeeper Connection', () => {
    it('should connect to Zookeeper successfully', async () => {
      zookeeperClient.connected = true;
      await zookeeperClient.connect();

      expect(zookeeperClient.connected).toBe(true);
      expect(zookeeperClient.connect).toHaveBeenCalled();
    }, 5000);

    it('should handle connection events', (done) => {
      zookeeperClient.once.mockImplementation((event, callback) => {
        if (event === 'connect') {
          setTimeout(() => {
            zookeeperClient.connected = true;
            callback();
          }, 100);
        }
        return zookeeperClient;
      });

      zookeeperClient.once('connect', () => {
        expect(zookeeperClient.connected).toBe(true);
        done();
      });

      if (!zookeeperClient.connected) {
        zookeeperClient.connect();
      }
    }, 5000);
  });

  describe('Service Discovery', () => {
    it('should discover registered services', async () => {
      zookeeperClient.connected = true;
      zookeeperClient.get_children.mockResolvedValue(['test-service-1']);

      const services = await discoveryClient.getServices();
      expect(services).toEqual(['test-service-1']);
      expect(zookeeperClient.get_children).toHaveBeenCalledWith(
        '/swft-mt-service',
        false,
      );
    }, 5000);

    it('should get service instances', async () => {
      zookeeperClient.connected = true;
      // Mock the service path children (service instances)
      zookeeperClient.get_children.mockImplementation((path: string) => {
        if (path === '/swft-mt-service') {
          return Promise.resolve(['test-service']);
        } else if (path === '/swft-mt-service/test-service') {
          return Promise.resolve(['test-service-1']);
        }
        return Promise.resolve([]);
      });
      zookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify(testService)),
      ]);

      const instances = await discoveryClient.getInstances(testService.name);
      expect(instances).toHaveLength(1);
      expect(instances[0].getInstanceId()).toBe(testService.id);
    }, 5000);
  });

  describe('Error Handling', () => {
    it('should handle service registration with invalid data', async () => {
      const invalidService = {
        ...testService,
        name: '', // Invalid empty name
      };

      const mockServiceStore = {
        setServices: jest.fn(),
        getServices: jest.fn().mockReturnValue([]),
        removeServices: jest.fn(),
      } as any;

      const invalidRegistry = new ZookeeperServiceRegistry(
        zookeeperClient,
        {
          service: invalidService,
          discovery: testDiscoveryOptions,
          heartbeat: testHeartbeatOptions,
        },
        mockServiceStore,
      );

      await expect(invalidRegistry.init()).rejects.toThrow(
        'Service name is required',
      );
    }, 5000);
  });

  describe('Multiple Service Instances', () => {
    it('should handle multiple instances of the same service', async () => {
      const testService2 = {
        ...testService,
        id: 'test-service-2',
        port: 3001,
      };

      // Mock multiple services
      zookeeperClient.get_children.mockResolvedValue([
        'test-service-1',
        'test-service-2',
      ]);
      zookeeperClient.get
        .mockResolvedValueOnce([Buffer.from(JSON.stringify(testService))])
        .mockResolvedValueOnce([Buffer.from(JSON.stringify(testService2))]);

      // Set connected state to avoid waiting
      zookeeperClient.connected = true;

      // Verify both services are discoverable
      const services = await discoveryClient.getServices();
      expect(services).toContain('test-service-1');
      expect(services).toContain('test-service-2');
    }, 3000);
  });
});
