import { ZookeeperHeartbeatTask } from './zookeeper-heartbeat.task';
import { ZookeeperClient } from '../zookeeper.client';

// Mock the Zookeeper client
jest.mock('../zookeeper.client');

describe('ZookeeperHeartbeatTask', () => {
  let heartbeatTask: ZookeeperHeartbeatTask;
  let mockZookeeperClient: jest.Mocked<ZookeeperClient>;

  beforeEach(() => {
    // Create mock Zookeeper client
    mockZookeeperClient = {
      connected: true,
      set: jest.fn(),
      close: jest.fn(),
    } as any;

    heartbeatTask = new ZookeeperHeartbeatTask(mockZookeeperClient, 'test-service-1');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create heartbeat task with correct check ID', () => {
      expect(heartbeatTask).toBeDefined();
      expect(heartbeatTask['checkId']).toBe('service:test-service-1');
      expect(heartbeatTask['client']).toBe(mockZookeeperClient);
    });

    it('should create heartbeat task with different service ID', () => {
      const task2 = new ZookeeperHeartbeatTask(mockZookeeperClient, 'test-service-2');
      expect(task2['checkId']).toBe('service:test-service-2');
    });

    it('should not add service: prefix if already present', () => {
      const taskWithPrefix = new ZookeeperHeartbeatTask(mockZookeeperClient, 'service:test-service-3');
      expect(taskWithPrefix['checkId']).toBe('service:test-service-3');
    });
  });

  describe('heartbeat execution', () => {
    it('should run heartbeat successfully', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'log');

      heartbeatTask.run();

      expect(loggerSpy).toHaveBeenCalledWith('Sending zookeeper heartbeat for: service:test-service-1');
    });

    it('should handle errors gracefully during run', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'error');
      
      // Mock the logger.log to throw an error
      jest.spyOn(heartbeatTask.logger, 'log').mockImplementation(() => {
        throw new Error('Logger error');
      });

      expect(() => heartbeatTask.run()).not.toThrow();
      expect(loggerSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('logger functionality', () => {
    it('should have a logger instance', () => {
      expect(heartbeatTask.logger).toBeDefined();
      expect(heartbeatTask.logger.constructor.name).toBe('Logger');
    });

    it('should log heartbeat messages correctly', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'log');

      heartbeatTask.run();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sending zookeeper heartbeat for:')
      );
    });
  });

  describe('service ID processing', () => {
    it('should handle empty service ID', () => {
      const taskWithEmptyId = new ZookeeperHeartbeatTask(mockZookeeperClient, '');
      // Empty string is falsy, so it becomes 'unknown'
      expect(taskWithEmptyId['checkId']).toBe('service:unknown');
    });

    it('should handle service ID with special characters', () => {
      const specialId = 'test-service-with-special-chars-@#$%^&*()';
      const taskWithSpecialId = new ZookeeperHeartbeatTask(mockZookeeperClient, specialId);
      expect(taskWithSpecialId['checkId']).toBe(`service:${specialId}`);
    });

    it('should handle very long service ID', () => {
      const longId = 'a'.repeat(1000);
      const taskWithLongId = new ZookeeperHeartbeatTask(mockZookeeperClient, longId);
      expect(taskWithLongId['checkId']).toBe(`service:${longId}`);
    });
  });

  describe('error handling', () => {
    it('should catch and log exceptions during run', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'error');
      
      // Mock the logger.log to throw an error
      jest.spyOn(heartbeatTask.logger, 'log').mockImplementation(() => {
        throw new Error('Test error');
      });

      heartbeatTask.run();

      expect(loggerSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle null service ID', () => {
      const taskWithNullId = new ZookeeperHeartbeatTask(mockZookeeperClient, null as any);
      // Null is falsy, so it becomes 'unknown'
      expect(taskWithNullId['checkId']).toBe('service:unknown');
    });

    it('should handle undefined service ID', () => {
      const taskWithUndefinedId = new ZookeeperHeartbeatTask(mockZookeeperClient, undefined as any);
      // Undefined is falsy, so it becomes 'unknown'
      expect(taskWithUndefinedId['checkId']).toBe('service:unknown');
    });
  });

  describe('integration scenarios', () => {
    it('should work with TTL scheduler', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'log');

      // Simulate multiple heartbeat executions
      for (let i = 0; i < 3; i++) {
        heartbeatTask.run();
      }

      expect(loggerSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent heartbeat runs', () => {
      const loggerSpy = jest.spyOn(heartbeatTask.logger, 'log');

      // Simulate concurrent heartbeat runs
      const promises = Array.from({ length: 10 }, () => {
        return new Promise<void>((resolve) => {
          heartbeatTask.run();
          resolve();
        });
      });

      return Promise.all(promises).then(() => {
        expect(loggerSpy).toHaveBeenCalledTimes(10);
      });
    });
  });
}); 