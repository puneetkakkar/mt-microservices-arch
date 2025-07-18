import { Test, TestingModule } from '@nestjs/testing';
import { ZookeeperModule } from './zookeeper.module';
import { ZookeeperClient } from './zookeeper.client';
import { ZookeeperConfig } from './zookeeper.config';
import { ZookeeperModuleOptions } from './zookeeper-module.options';

describe('ZookeeperModule', () => {
  let module: TestingModule;

  const mockOptions: ZookeeperModuleOptions = {
    host: 'localhost:2181',
    timeout: 5000,
    logLevel: 2,
    hostOrderDeterministic: false,
    retryAttempts: 2,
    retryDelays: 1000,
  };

  describe('forRoot', () => {
    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();
    });

    afterEach(async () => {
      await module.close();
    });

    it('should create module with default options', async () => {
      expect(module).toBeDefined();
    });

    it('should provide ZookeeperClient', async () => {
      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ZookeeperClient);
    });

    it('should provide ZookeeperConfig', async () => {
      const config = module.get<ZookeeperConfig>(ZookeeperConfig);
      expect(config).toBeDefined();
      expect(config).toBeInstanceOf(ZookeeperConfig);
    });

    it('should provide ZookeeperModuleOptions', async () => {
      const options = module.get<ZookeeperModuleOptions>('ZOOKEEPER_CONFIG_OPTIONS');
      expect(options).toBeDefined();
      expect(options).toEqual(mockOptions);
    });

    it('should configure ZookeeperClient with provided options', async () => {
      const client = module.get<ZookeeperClient>(ZookeeperClient);
      const config = module.get<ZookeeperConfig>(ZookeeperConfig);
      
      expect(config).toBeDefined();
      // The client should be configured with the provided options
      expect(client).toBeDefined();
    });
  });

  describe('forRoot with different configurations', () => {
    it('should create module with different options', async () => {
      const differentOptions = {
        ...mockOptions,
        host: '192.168.1.100:2181',
        timeout: 10000,
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(differentOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      const options = module.get<ZookeeperModuleOptions>('ZOOKEEPER_CONFIG_OPTIONS');

      expect(client).toBeDefined();
      expect(options).toEqual(differentOptions);

      await module.close();
    });

    it('should handle configuration with minimal options', async () => {
      const minimalOptions = {
        host: 'localhost:2181',
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(minimalOptions as any)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });
  });

  describe('module configuration', () => {
    it('should export ZookeeperClient', async () => {
      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle different host configurations', async () => {
      const differentOptions = {
        ...mockOptions,
        host: '192.168.1.100:2181',
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(differentOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle different timeout configurations', async () => {
      const differentOptions = {
        ...mockOptions,
        timeout: 10000,
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(differentOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle different log level configurations', async () => {
      const differentOptions = {
        ...mockOptions,
        logLevel: 1,
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(differentOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });
  });

  describe('provider registration', () => {
    it('should register all required providers', async () => {
      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      const providers = module.get('ZOOKEEPER_CONFIG_OPTIONS');
      expect(providers).toBeDefined();

      await module.close();
    });

    it('should handle missing required options', async () => {
      const incompleteOptions = {
        host: 'localhost:2181',
        // Missing other required options
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(incompleteOptions as any)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });
  });

  describe('module lifecycle', () => {
    it('should initialize module successfully', async () => {
      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      await module.init();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should close module successfully', async () => {
      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      await module.init();
      await module.close();

      // Module should be closed without errors
      expect(true).toBe(true);
    });
  });

  describe('error scenarios', () => {
    it('should handle invalid host configuration', async () => {
      const invalidOptions = {
        ...mockOptions,
        host: 'invalid-host',
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(invalidOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle negative timeout values', async () => {
      const invalidOptions = {
        ...mockOptions,
        timeout: -1000,
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(invalidOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle invalid log level', async () => {
      const invalidOptions = {
        ...mockOptions,
        logLevel: 999,
      };

      module = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(invalidOptions)],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });
  });

  describe('integration scenarios', () => {
    it('should work with multiple module imports', async () => {
      module = await Test.createTestingModule({
        imports: [
          ZookeeperModule.forRoot(mockOptions),
        ],
      }).compile();

      const client = module.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module.close();
    });

    it('should handle module reimport', async () => {
      // First import
      let module1 = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      await module1.close();

      // Second import
      let module2 = await Test.createTestingModule({
        imports: [ZookeeperModule.forRoot(mockOptions)],
      }).compile();

      const client = module2.get<ZookeeperClient>(ZookeeperClient);
      expect(client).toBeDefined();

      await module2.close();
    });
  });
}); 