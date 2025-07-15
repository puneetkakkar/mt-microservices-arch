import { DynamicModule, Module } from '@nestjs/common';
import { ZookeeperModuleOptions } from './zookeeper-module.options';
import { ZOOKEEPER_CONFIG_OPTIONS } from './zookeeper.constant';

@Module({})
export class ZookeeperModule {
  static forRoot(options: ZookeeperModuleOptions): DynamicModule {
    return {
      module: ZookeeperModule,
      providers: [
        {
          provide: ZOOKEEPER_CONFIG_OPTIONS,
          useValue: options,
        },
      ],
      exports: [],
      global: true,
    };
  }
}
