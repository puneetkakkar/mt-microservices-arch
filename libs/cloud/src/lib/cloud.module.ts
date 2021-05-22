import { DynamicModule, Global, Module } from '@nestjs/common';
import { CloudModuleOptions } from './interfaces';
import { getSharedProviderUtils } from './utils';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class CloudModule {
  static forRoot(options: CloudModuleOptions): DynamicModule {
    const sharedProviders = getSharedProviderUtils(options.registry);

    return {
      module: CloudModule,
      providers: sharedProviders,
      exports: sharedProviders,
      global: true,
    };
  }
}
