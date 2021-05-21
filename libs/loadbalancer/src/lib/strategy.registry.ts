import { Injectable } from '@nestjs/common';
import { ServiceInstance } from '@swft-mt/common';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class StrategyRegistry {
  private readonly strategies = new Map<
    string,
    BaseStrategy<ServiceInstance>
  >();

  public addStrategy(name: string, strategy: BaseStrategy<ServiceInstance>) {
    if (!this.strategies.has(name)) {
      this.strategies.set(name, strategy);
    }
  }

  public getStrategy(name: string): BaseStrategy<ServiceInstance> | undefined {
    return this.strategies.get(name);
  }
}
