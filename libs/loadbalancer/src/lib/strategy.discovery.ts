import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClassWithArgs, getMetadataStorage } from '@swft-mt/common';
import { StrategyRegistry } from './strategy.registry';

@Injectable()
export class StrategyDiscovery implements OnModuleInit {
  constructor(private readonly strategyRegistry: StrategyRegistry) {}

  discover() {
    try {
      const list = getMetadataStorage().strategies;
      for (const ref of list) {
        if (ref.target) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const StrategyClass: ClassWithArgs<typeof ref.target> = ref.target;
          // const strategy = (new StrategyClass() as unknown) as BaseStrategy<ServiceInstance>;
          this.strategyRegistry.addStrategy<ClassWithArgs<typeof ref.target>>(
            ref.name || ref.target.name,
            StrategyClass,
          );
        }
      }
    } catch (e) {
      Logger.error(e);
    }
  }

  onModuleInit() {
    this.discover();
  }
}
