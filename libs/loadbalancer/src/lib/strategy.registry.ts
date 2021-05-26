import { Injectable } from '@nestjs/common';
import { ClassWithArgs, ServiceInstance } from '@swft-mt/common';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class StrategyRegistry {
  private readonly strategies = new Map<string, any>();

  public addStrategy<T>(name: string, strategy: T) {
    if (!this.strategies.has(name)) {
      this.strategies.set(name, strategy as T);
    }
  }

  public getStrategy(name: string): any | undefined {
    return this.strategies.get(name);
  }
}
