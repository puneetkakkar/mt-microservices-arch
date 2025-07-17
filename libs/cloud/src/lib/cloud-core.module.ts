import { DynamicModule, Global, Module } from '@nestjs/common';
import { CloudModuleOptions } from './interfaces';
import { getSharedProviderUtils } from './utils';

@Global()
@Module({})
export class CloudCoreModule {
  static forRoot(options: CloudModuleOptions): DynamicModule {
    const sharedProviders = getSharedProviderUtils(options.registry);

    return {
      module: CloudCoreModule,
      providers: sharedProviders,
      exports: sharedProviders,
    };
  }
} 