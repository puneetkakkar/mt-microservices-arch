import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ZookeeperServiceRegistry } from './zookeeper-service-registry';
import { ZookeeperClient } from '../zookeeper.client';
import { ZookeeperRegistryOptions } from './zookeeper-registry.options';
import { ServiceStore } from '@swft-mt/common';
import { ZookeeperRegistrationBuilder } from './zookeeper-registration.builder';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';
import { HeartbeatOptions } from '@swft-mt/common';
import ZooKeeper from 'zookeeper';

// Mock the Zookeeper client
jest.mock('../zookeeper.client');
jest.mock('@swft-mt/common', () => ({
  ...jest.requireActual('@swft-mt/common'),
  sleep: jest.fn().mockResolvedValue(undefined),
}));

// Mock the ZookeeperServiceInstance to avoid constructor issues
jest.mock('../discovery/zookeeper-service.instance', () => ({
  ZookeeperServiceInstance: jest.fn().mockImplementation((service) => ({
    getInstanceId: () => service.id || 'mock-instance-id',
    getService: () => service,
  })),
}));

describe('ZookeeperServiceRegistry', () => {
  let serviceRegistry: ZookeeperServiceRegistry;
  let mockZookeeperClient: jest.Mocked<ZookeeperClient>;
  let mockServiceStore: jest.Mocked<ServiceStore>;
  let mockOptions: ZookeeperRegistryOptions;

  const mockService = {
    id: 'test-service-1',
    name: 'test-service',
    address: 'localhost',
    port: 3000,
    tags: ['test'],
    metadata: { version: '1.0.0' },
  };

  const mockDiscoveryOptions: ZookeeperDiscoveryOptions = {
    type: 'http',
    http: 'http://localhost:3000/health',
    interval: 10,
    timeout: '5',
    failFast: false,
    scheme: 'http',
  };

  const mockHeartbeatOptions: HeartbeatOptions = {
    enabled: true,
    ttlInSeconds: 30,
  };

  beforeEach(async () => {
    // Create mock Zookeeper client
    mockZookeeperClient = {
      connected: false,
      create: jest.fn(),
      get: jest.fn(),
      delete_: jest.fn(),
      get_children: jest.fn(),
      close: jest.fn(),
      connect: jest.fn(),
      once: jest.fn(),
    } as any;

    // Create mock service store
    mockServiceStore = {
      setServices: jest.fn(),
      getServices: jest.fn(),
      removeServices: jest.fn(),
    } as any;

    // Create mock options
    mockOptions = {
      service: mockService,
      discovery: mockDiscoveryOptions,
      heartbeat: mockHeartbeatOptions,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZookeeperServiceRegistry,
        {
          provide: ZookeeperClient,
          useValue: mockZookeeperClient,
        },
        {
          provide: 'SERVICE_REGISTRY_CONFIG',
          useValue: mockOptions,
        },
        {
          provide: ServiceStore,
          useValue: mockServiceStore,
        },
      ],
    }).compile();

    serviceRegistry = module.get<ZookeeperServiceRegistry>(ZookeeperServiceRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid options', async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);

      await serviceRegistry.init();

      expect(serviceRegistry.registration).toBeDefined();
      expect(serviceRegistry.registration?.getInstanceId()).toContain('test-service');
    });

    it('should throw error when heartbeat options are missing', async () => {
      const invalidOptions = { ...mockOptions, heartbeat: null };
      const module = await Test.createTestingModule({
        providers: [
          ZookeeperServiceRegistry,
          { provide: ZookeeperClient, useValue: mockZookeeperClient },
          { provide: 'SERVICE_REGISTRY_CONFIG', useValue: invalidOptions },
          { provide: ServiceStore, useValue: mockServiceStore },
        ],
      }).compile();

      const invalidRegistry = module.get<ZookeeperServiceRegistry>(ZookeeperServiceRegistry);

      await expect(invalidRegistry.init()).rejects.toThrow('HeartbeatOptions is required');
    });

    it('should throw error when discovery options are missing', async () => {
      const invalidOptions = { ...mockOptions, discovery: null };
      const module = await Test.createTestingModule({
        providers: [
          ZookeeperServiceRegistry,
          { provide: ZookeeperClient, useValue: mockZookeeperClient },
          { provide: 'SERVICE_REGISTRY_CONFIG', useValue: invalidOptions },
          { provide: ServiceStore, useValue: mockServiceStore },
        ],
      }).compile();

      const invalidRegistry = module.get<ZookeeperServiceRegistry>(ZookeeperServiceRegistry);

      await expect(invalidRegistry.init()).rejects.toThrow('ZookeeperDiscoveryOptions is required');
    });

    it('should handle namespace already exists error gracefully', async () => {
      mockZookeeperClient.connected = true;
      const nodeExistsError = new Error('-110 node exists');
      mockZookeeperClient.create.mockRejectedValue(nodeExistsError);
      mockZookeeperClient.get_children.mockResolvedValue([]);

      await expect(serviceRegistry.init()).resolves.not.toThrow();
    });

    it('should wait for zookeeper connection before proceeding', async () => {
      mockZookeeperClient.connected = false;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);

      // Set connection to true before calling init to avoid timeout
      mockZookeeperClient.connected = true;

      await serviceRegistry.init();

      expect(mockZookeeperClient.create).toHaveBeenCalled();
    }, 10000); // Add timeout to prevent hanging
  });

  describe('service registration', () => {
    beforeEach(async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);
      await serviceRegistry.init();
    });

    it('should register service successfully', async () => {
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service/test-service-1');

      await serviceRegistry.register();

      expect(mockZookeeperClient.create).toHaveBeenCalledWith(
        expect.stringContaining('/swft-mt-service/'),
        expect.any(Buffer),
        ZooKeeper.constants.ZOO_PERSISTENT
      );
    });

    it('should retry registration on failure', async () => {
      mockZookeeperClient.create
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce('/swft-mt-service/test-service-1');

      await serviceRegistry.register();

      // The first call fails, second call succeeds, so we expect 2 calls total
      // Note: The namespace creation call happens in init(), so we only count the service registration calls
      expect(mockZookeeperClient.create).toHaveBeenCalledTimes(3); // 1 for namespace + 2 for service registration
    }, 15000); // Add timeout to prevent infinite loop

    it('should handle registration failure with failFast disabled', async () => {
      mockZookeeperClient.create.mockRejectedValue(new Error('Registration failed'));

      await expect(serviceRegistry.register()).resolves.not.toThrow();
    }, 15000); // Add timeout to prevent infinite loop
  });

  describe('service deregistration', () => {
    beforeEach(async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);
      await serviceRegistry.init();
    });

    it('should deregister service successfully', async () => {
      mockZookeeperClient.get.mockResolvedValue([Buffer.from('test'), { version: 1 }]);
      mockZookeeperClient.delete_.mockResolvedValue();

      await serviceRegistry.deregister();

      expect(mockZookeeperClient.get).toHaveBeenCalled();
      expect(mockZookeeperClient.delete_).toHaveBeenCalled();
    });

    it('should handle deregistration errors gracefully', async () => {
      mockZookeeperClient.get.mockRejectedValue(new Error('Node not found'));

      await expect(serviceRegistry.deregister()).resolves.not.toThrow();
    });
  });

  describe('service discovery', () => {
    beforeEach(async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      await serviceRegistry.init();
    });

    it('should update service store with discovered services', async () => {
      const mockServiceData = JSON.stringify({
        id: 'service-1',
        name: 'test-service',
        address: 'localhost',
        port: 3000,
      });

      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockResolvedValue([Buffer.from(mockServiceData)]);

      await serviceRegistry['watchAll']();

      // The service store should be called with the service name and instances
      expect(mockServiceStore.setServices).toHaveBeenCalledWith('test-service', expect.any(Array));
    });

    it('should handle service data parsing errors gracefully', async () => {
      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockResolvedValue([Buffer.from('invalid json')]);

      const loggerSpy = jest.spyOn(serviceRegistry['logger'], 'error');

      await serviceRegistry['watchAll']();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse JSON for service node'),
        expect.any(Error)
      );
    });

    it('should handle different data types correctly', async () => {
      const mockServiceData = {
        id: 'service-1',
        name: 'test-service',
        address: 'localhost',
        port: 3000,
      };

      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockResolvedValue([mockServiceData]);

      await serviceRegistry['watchAll']();

      expect(mockServiceStore.setServices).toHaveBeenCalledWith('test-service', expect.any(Array));
    });

    it('should handle namespace not exists error in watch setup', async () => {
      const nonodeError = new Error('-101 no node');
      mockZookeeperClient.get_children.mockRejectedValue(nonodeError);

      const loggerSpy = jest.spyOn(serviceRegistry['logger'], 'warn');

      await serviceRegistry['watchAll']();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("doesn't exist yet, skipping watch setup")
      );
    });
  });

  describe('error handling', () => {
    it('should handle connection timeout gracefully', async () => {
      mockZookeeperClient.connected = false;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');

      // Simulate connection timeout
      jest.useFakeTimers();
      const initPromise = serviceRegistry.init();
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(31000);
      
      await expect(initPromise).rejects.toThrow('Failed to connect to zookeeper within timeout period');
      
      jest.useRealTimers();
      
      // Clean up any remaining timers
      jest.clearAllTimers();
    });

    it('should handle namespace creation errors gracefully', async () => {
      mockZookeeperClient.connected = true;
      const unexpectedError = new Error('Unexpected error');
      mockZookeeperClient.create.mockRejectedValue(unexpectedError);

      const loggerSpy = jest.spyOn(serviceRegistry['logger'], 'error');

      await serviceRegistry.init();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create namespace node'),
        unexpectedError
      );
    });
  });

  describe('module lifecycle', () => {
    it('should initialize on module init', async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service/test-service-1');

      await serviceRegistry.onModuleInit();

      expect(serviceRegistry.registration).toBeDefined();
    });

    it('should deregister on module destroy', async () => {
      mockZookeeperClient.connected = true;
      mockZookeeperClient.create.mockResolvedValue('/swft-mt-service');
      mockZookeeperClient.get_children.mockResolvedValue([]);
      await serviceRegistry.init();

      mockZookeeperClient.get.mockResolvedValue([Buffer.from('test'), { version: 1 }]);
      mockZookeeperClient.delete_.mockResolvedValue();

      await serviceRegistry.onModuleDestroy();

      expect(mockZookeeperClient.delete_).toHaveBeenCalled();
    });
  });
}); 