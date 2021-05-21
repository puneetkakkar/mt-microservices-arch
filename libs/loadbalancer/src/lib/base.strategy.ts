import { Type } from '@nestjs/common';

/**
 * Base load-balance strategy
 */
export abstract class BaseStrategy<T> {
  init(serviceName: string, list: any): void {
    throw new Error('Not Implemented');
  }

  /**
   * Pick a service instance
   */
  choose(): T {
    throw new Error('Not Implemented');
  }

  static getInstance<K>(name: string, type: Type<K>): K {
    throw new Error('Not Implemented');
  }
}
