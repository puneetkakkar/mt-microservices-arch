import { DynamicModule, Module } from '@nestjs/common';
import { ZookeeperModuleOptions } from './zookeeper-module.options';
import { ZOOKEEPER_CONFIG_OPTIONS } from './zookeeper.constant';
import { ZookeeperConfig } from './zookeeper.config';
import { ZookeeperClient } from './zookeeper.client';

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
        ZookeeperConfig,
        ZookeeperClient,
      ],
      exports: [ZookeeperClient],
      global: true,
    };
  }
}

