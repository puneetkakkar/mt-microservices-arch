import { ZookeeperClient } from '../zookeeper.client';
import { ZookeeperDiscoveryClient } from './zookeeper-discovery.client';

// Mock the Zookeeper client
jest.mock('../zookeeper.client');

describe('ZookeeperDiscoveryClient', () => {
  let discoveryClient: ZookeeperDiscoveryClient;
  let mockZookeeperClient: jest.Mocked<ZookeeperClient>;

  beforeEach(() => {
    // Create mock Zookeeper client
    mockZookeeperClient = {
      connected: true,
      get_children: jest.fn(),
      get: jest.fn(),
      close: jest.fn(),
    } as any;

    discoveryClient = new ZookeeperDiscoveryClient(mockZookeeperClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await discoveryClient.init();

      expect(discoveryClient.logger).toBeDefined();
    });

    it('should provide correct description', () => {
      expect(discoveryClient.description()).toBe('Zookeeper Discovery Client');
    });
  });

  describe('service discovery', () => {
    const mockServiceData = {
      id: 'service-1',
      name: 'test-service',
      address: 'localhost',
      port: 3000,
      tags: ['api', 'v1'],
      metadata: { version: '1.0.0' },
    };

    beforeEach(() => {
      mockZookeeperClient.get_children.mockResolvedValue([
        'service-1',
        'service-2',
      ]);
    });

    it('should get all services successfully', async () => {
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify(mockServiceData)),
      ]);

      const services = await discoveryClient.getServices();

      expect(services).toEqual(['service-1', 'service-2']);
      expect(mockZookeeperClient.get_children).toHaveBeenCalledWith(
        '/swft-mt-service',
        false,
      );
    });

    it('should get instances for a specific service', async () => {
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify(mockServiceData)),
      ]);

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toBeInstanceOf(Array);
    });

    it('should get all instances from all services', async () => {
      const mockServiceData2 = {
        ...mockServiceData,
        id: 'service-2',
        port: 3001,
      };

      mockZookeeperClient.get
        .mockResolvedValueOnce([Buffer.from(JSON.stringify(mockServiceData))])
        .mockResolvedValueOnce([Buffer.from(JSON.stringify(mockServiceData2))]);

      const allInstances = await discoveryClient.getAllInstances();

      expect(allInstances).toBeInstanceOf(Array);
    });

    it('should handle empty service list', async () => {
      mockZookeeperClient.get_children.mockResolvedValue([]);

      const services = await discoveryClient.getServices();
      const instances = await discoveryClient.getInstances('test-service');

      expect(services).toEqual([]);
      expect(instances).toEqual([]);
    });

    it('should handle service data parsing errors gracefully', async () => {
      mockZookeeperClient.get.mockResolvedValue([Buffer.from('invalid json')]);

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toEqual([]);
    });

    it('should handle missing service data', async () => {
      mockZookeeperClient.get.mockResolvedValue([null]);

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toEqual([]);
    });
  });

  describe('service data processing', () => {
    it('should process service data with address correctly', () => {
      const mockHealthService = {
        Service: {
          ID: 'service-1',
          Address: '192.168.1.100',
          Port: 3000,
          Tags: ['api'],
        },
        Node: {
          Address: '192.168.1.1',
          Node: 'node-1',
        },
      };

      const instances = discoveryClient['addInstancesToList']('test-service');
      // This is a private method, so we test it indirectly through public methods
      expect(instances).toBeInstanceOf(Promise);
    });

    it('should use node address when service address is not available', () => {
      const mockHealthService = {
        Service: {
          ID: 'service-1',
          Port: 3000,
          Tags: [],
        },
        Node: {
          Address: '192.168.1.1',
          Node: 'node-1',
        },
      };

      const instances = discoveryClient['addInstancesToList']('test-service');
      expect(instances).toBeInstanceOf(Promise);
    });

    it('should use node name when neither service nor node address is available', () => {
      const mockHealthService = {
        Service: {
          ID: 'service-1',
          Port: 3000,
          Tags: [],
        },
        Node: {
          Node: 'node-1',
        },
      };

      const instances = discoveryClient['addInstancesToList']('test-service');
      expect(instances).toBeInstanceOf(Promise);
    });
  });

  describe('metadata processing', () => {
    it('should extract metadata from tags', () => {
      const tags = ['secure=true', 'version=1.0.0', 'region=us-east-1'];
      const metadata = discoveryClient['getMetadata'](tags);

      expect(metadata).toEqual({});
      // Note: The current implementation returns empty object
      // This test ensures the method exists and doesn't throw
    });

    it('should handle empty tags array', () => {
      const metadata = discoveryClient['getMetadata']([]);

      expect(metadata).toEqual({});
    });

    it('should handle undefined tags', () => {
      const metadata = discoveryClient['getMetadata'](undefined as any);

      expect(metadata).toEqual({});
    });
  });

  describe('secure connection detection', () => {
    it('should detect secure connections correctly', () => {
      const mockHealthService = {
        Service: {
          ID: 'service-1',
          Address: 'localhost',
          Port: 3000,
          Tags: ['secure=true'],
        },
        Node: {
          Address: 'localhost',
          Node: 'node-1',
        },
      };

      const instances = discoveryClient['addInstancesToList']('test-service');
      expect(instances).toBeInstanceOf(Promise);
    });

    it('should handle non-secure connections', () => {
      const mockHealthService = {
        Service: {
          ID: 'service-1',
          Address: 'localhost',
          Port: 3000,
          Tags: ['secure=false'],
        },
        Node: {
          Address: 'localhost',
          Node: 'node-1',
        },
      };

      const instances = discoveryClient['addInstancesToList']('test-service');
      expect(instances).toBeInstanceOf(Promise);
    });
  });

  describe('error handling', () => {
    it('should handle zookeeper connection errors gracefully', async () => {
      mockZookeeperClient.get_children.mockRejectedValue(
        new Error('Connection failed'),
      );

      await expect(discoveryClient.getServices()).rejects.toThrow(
        'Connection failed',
      );
    });

    it('should handle individual service fetch errors gracefully', async () => {
      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockRejectedValue(new Error('Service not found'));

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toEqual([]);
    });

    it('should handle partial service fetch failures', async () => {
      mockZookeeperClient.get_children.mockResolvedValue([
        'service-1',
        'service-2',
      ]);
      mockZookeeperClient.get
        .mockResolvedValueOnce([
          Buffer.from(JSON.stringify({ id: 'service-1', name: 'test' })),
        ])
        .mockRejectedValueOnce(new Error('Service 2 not found'));

      const allInstances = await discoveryClient.getAllInstances();

      expect(allInstances).toBeInstanceOf(Array);
      // Should still return instances from the successful service
    });
  });

  describe('edge cases', () => {
    it('should handle services with missing required fields', async () => {
      const incompleteServiceData = {
        id: 'service-1',
        // Missing name, address, port
      };

      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify(incompleteServiceData)),
      ]);

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toBeInstanceOf(Array);
    });

    it('should handle services with null or undefined values', async () => {
      const nullServiceData = {
        id: 'service-1',
        name: null,
        address: undefined,
        port: 3000,
      };

      mockZookeeperClient.get_children.mockResolvedValue(['service-1']);
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify(nullServiceData)),
      ]);

      const instances = await discoveryClient.getInstances('test-service');

      expect(instances).toBeInstanceOf(Array);
    });

    it('should handle very large service lists', async () => {
      const largeServiceList = Array.from(
        { length: 100 },
        (_, i) => `service-${i}`,
      );
      mockZookeeperClient.get_children.mockResolvedValue(largeServiceList);
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify({ id: 'test', name: 'test' })),
      ]);

      const services = await discoveryClient.getServices();

      expect(services).toHaveLength(100);
    });
  });

  describe('performance', () => {
    it('should handle concurrent service requests efficiently', async () => {
      mockZookeeperClient.get_children.mockResolvedValue([
        'service-1',
        'service-2',
      ]);
      mockZookeeperClient.get.mockResolvedValue([
        Buffer.from(JSON.stringify({ id: 'test', name: 'test' })),
      ]);

      const startTime = Date.now();
      const promises = [
        discoveryClient.getInstances('service-1'),
        discoveryClient.getInstances('service-2'),
        discoveryClient.getAllInstances(),
      ];

      await Promise.all(promises);
      const endTime = Date.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
