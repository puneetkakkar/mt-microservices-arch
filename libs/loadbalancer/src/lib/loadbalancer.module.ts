import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoadBalancerModuleOptions } from './interfaces/loadbalancer-module-options.interface';
import { LoadBalancerClient } from './loadbalancer.client';
import { LoadBalancerConfig } from './loadbalancer.config';
import { LOAD_BALANCE_CONFIG_OPTIONS } from './loadbalancer.constants';
import { RandomStrategy } from './strategy';
import { StrategyDiscovery } from './strategy.discovery';
import { StrategyRegistry } from './strategy.registry';

@Global()
@Module({
  imports: [],
  providers: [],
})
export class LoadBalancerModule {
  static forRoot(options?: LoadBalancerModuleOptions): DynamicModule {
    return {
      module: LoadBalancerModule,
      imports: [],
      providers: [
        { provide: LOAD_BALANCE_CONFIG_OPTIONS, useValue: options || {} },
        LoadBalancerConfig,
        StrategyDiscovery,
        RandomStrategy,
        LoadBalancerClient,
        StrategyRegistry,
      ],
      exports: [LoadBalancerClient],
      global: true,
    };
  }
}
