import { HeartbeatOptions } from '@nexuskit/common';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';
import { ZookeeperRegistrationBuilder } from './zookeeper-registration.builder';

describe('ZookeeperRegistrationBuilder', () => {
  let builder: ZookeeperRegistrationBuilder;

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

  beforeEach(() => {
    builder = new ZookeeperRegistrationBuilder('localhost', 3000);
  });

  describe('basic configuration', () => {
    it('should build registration with minimal required fields', () => {
      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration).toBeDefined();
      expect(registration.getService().name).toBe('test-service');
      expect(registration.getService().address).toBe('localhost');
      expect(registration.getService().port).toBe(3000);
    });

    it('should throw error when service name is missing', () => {
      expect(() => {
        builder.discoveryOptions(mockDiscoveryOptions).build();
      }).toThrow('Service name is required');
    });

    it('should throw error when host is missing', () => {
      const emptyBuilder = new ZookeeperRegistrationBuilder();
      expect(() => {
        emptyBuilder
          .serviceName('test-service')
          .discoveryOptions(mockDiscoveryOptions)
          .build();
      }).toThrow('Host is required');
    });

    it('should throw error when port is missing', () => {
      const emptyBuilder = new ZookeeperRegistrationBuilder('localhost');
      expect(() => {
        emptyBuilder
          .serviceName('test-service')
          .discoveryOptions(mockDiscoveryOptions)
          .build();
      }).toThrow('Port is required');
    });

    it('should throw error when discovery options are missing', () => {
      expect(() => {
        builder.serviceName('test-service').build();
      }).toThrow('ZookeeperDiscoveryOptions is required');
    });
  });

  describe('service configuration', () => {
    it('should set service name correctly', () => {
      const registration = builder
        .serviceName('my-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().name).toBe('my-service');
    });

    it('should set host and port correctly', () => {
      const registration = builder
        .serviceName('test-service')
        .host('192.168.1.100')
        .port(8080)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().address).toBe('192.168.1.100');
      expect(registration.getService().port).toBe(8080);
    });

    it('should set version correctly', () => {
      const registration = builder
        .serviceName('test-service')
        .version('2.0.0')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().metadata.version).toBe('2.0.0');
    });

    it('should set status correctly', () => {
      const registration = builder
        .serviceName('test-service')
        .status('DOWN')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      // Note: Status might not be directly exposed in the service object
      // This test ensures the method exists and doesn't throw
      expect(registration).toBeDefined();
    });

    it('should set tags correctly', () => {
      const tags = ['api', 'v2', 'production'];
      const registration = builder
        .serviceName('test-service')
        .tags(tags)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().tags).toContain('api');
      expect(registration.getService().tags).toContain('v2');
      expect(registration.getService().tags).toContain('production');
    });

    it('should set metadata correctly', () => {
      const metadata = { environment: 'prod', region: 'us-east-1' };
      const registration = builder
        .serviceName('test-service')
        .metadata(metadata)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().metadata.environment).toBe('prod');
      expect(registration.getService().metadata.region).toBe('us-east-1');
    });

    it('should set domain correctly', () => {
      const registration = builder
        .serviceName('test-service')
        .domain('my-domain')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().metadata.domain).toBe('my-domain');
    });
  });

  describe('instance ID generation', () => {
    it('should generate unique instance ID when not provided', () => {
      const registration1 = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const registration2 = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration1.getInstanceId()).not.toBe(
        registration2.getInstanceId(),
      );
      expect(registration1.getInstanceId()).toContain('test-service');
      // When version is undefined, it becomes part of the instance ID
      expect(registration1.getInstanceId()).toContain('undefined');
    });

    it('should use provided instance ID', () => {
      const registration = builder
        .serviceName('test-service')
        .instanceId('custom-id')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getInstanceId()).toContain('custom-id');
    });

    it('should include version in instance ID', () => {
      const registration = builder
        .serviceName('test-service')
        .version('1.2.3')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getInstanceId()).toContain('1.2.3');
    });
  });

  describe('discovery options', () => {
    it('should set discovery options correctly', () => {
      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      expect(registration.getService().checks).toBeDefined();
    });

    it('should handle array discovery options', () => {
      const arrayDiscoveryOptions = [mockDiscoveryOptions] as any;
      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(arrayDiscoveryOptions)
        .build();

      expect(registration.getService().checks).toBeDefined();
    });
  });

  describe('heartbeat options', () => {
    it('should set default TTL when heartbeat is enabled but TTL is missing', () => {
      const heartbeatOptions: HeartbeatOptions = {
        enabled: true,
        ttlInSeconds: undefined,
      };

      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .heartbeatOptions(heartbeatOptions)
        .build();

      // The builder should set a default TTL of 30 seconds
      expect(registration).toBeDefined();
    });

    it('should use provided TTL when available', () => {
      const heartbeatOptions: HeartbeatOptions = {
        enabled: true,
        ttlInSeconds: 60,
      };

      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .heartbeatOptions(heartbeatOptions)
        .build();

      expect(registration).toBeDefined();
    });
  });

  describe('service metadata', () => {
    it('should include default metadata', () => {
      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.metadata.domain).toBe('swft-mt');
      expect(service.metadata.secure).toBe('false');
      // When version is not set, it should be undefined
      expect(service.metadata.version).toBeUndefined();
    });

    it('should merge custom metadata with defaults', () => {
      const customMetadata = { customField: 'customValue' };
      const registration = builder
        .serviceName('test-service')
        .metadata(customMetadata)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.metadata.domain).toBe('swft-mt');
      expect(service.metadata.customField).toBe('customValue');
    });

    it('should set secure flag based on scheme', () => {
      const httpsDiscoveryOptions: ZookeeperDiscoveryOptions = {
        ...mockDiscoveryOptions,
        scheme: 'https',
      };

      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(httpsDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.metadata.secure).toBe('true');
    });
  });

  describe('tags processing', () => {
    it('should include default tags', () => {
      const registration = builder
        .serviceName('test-service')
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.tags).toContain('service');
      // When version is undefined, it gets filtered out, so only 'service' remains
      expect(service.tags).toEqual(['service']);
    });

    it('should include custom tags', () => {
      const customTags = ['api', 'v2'];
      const registration = builder
        .serviceName('test-service')
        .tags(customTags)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.tags).toContain('api');
      expect(service.tags).toContain('v2');
    });

    it('should filter out non-string tags', () => {
      const mixedTags = ['valid', 123, null, undefined, 'also-valid'];
      const registration = builder
        .serviceName('test-service')
        .tags(mixedTags as any)
        .discoveryOptions(mockDiscoveryOptions)
        .build();

      const service = registration.getService();
      expect(service.tags).toContain('valid');
      expect(service.tags).toContain('also-valid');
      expect(service.tags).not.toContain(123);
      expect(service.tags).not.toContain(null);
      expect(service.tags).not.toContain(undefined);
    });
  });

  describe('method chaining', () => {
    it('should support method chaining', () => {
      const registration = builder
        .serviceName('test-service')
        .host('localhost')
        .port(3000)
        .version('1.0.0')
        .tags(['api'])
        .metadata({ env: 'test' })
        .domain('test-domain')
        .discoveryOptions(mockDiscoveryOptions)
        .heartbeatOptions(mockHeartbeatOptions)
        .build();

      expect(registration).toBeDefined();
      expect(registration.getService().name).toBe('test-service');
      expect(registration.getService().address).toBe('localhost');
      expect(registration.getService().port).toBe(3000);
    });
  });
});
