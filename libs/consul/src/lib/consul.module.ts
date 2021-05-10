import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConsulClient } from './consul.client';
import { ConsulConfig } from './consul.config';
import { CONSUL_CONFIG_OPTIONS } from './consul.constants';
import { ConsulModuleOptions } from './interfaces/consul-module.options';

@Global()
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class ConsulModule {
  static forRoot(options: ConsulModuleOptions): DynamicModule {
    const providers = [
      {
        provide: CONSUL_CONFIG_OPTIONS,
        useValue: options,
      },
      ConsulConfig,
      ConsulClient,
    ];

    return {
      module: ConsulModule,
      providers,
      exports: providers,
    };
  }
}
