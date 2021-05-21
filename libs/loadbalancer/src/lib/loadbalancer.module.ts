import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LoadBalancerModuleOptions } from './interfaces/loadbalancer-module-options.interface';
import { LoadBalancerClient } from './loadbalancer.client';
import { LoadBalancerConfig } from './loadbalancer.config';
import { LOAD_BALANCE_CONFIG_OPTIONS } from './loadbalancer.constants';
import { RandomStrategy } from './strategy';
import { StrategyDiscovery } from './strategy.discovery';
import { StrategyRegistry } from './strategy.registry';

@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class LoadbalancerModule {
  static forRoot(options?: LoadBalancerModuleOptions): DynamicModule {
    return {
      module: LoadbalancerModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: LOAD_BALANCE_CONFIG_OPTIONS, useValue: options || {} },
        LoadBalancerConfig,
        StrategyDiscovery,
        RandomStrategy,
        LoadBalancerClient,
        StrategyRegistry,
      ],
      exports: [LoadBalancerClient],
    };
  }
}
