import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { assign } from 'lodash';
import { resolve } from 'path';
import { BootConfigFileLoader } from './boot-config-file.loader';
import { BootConfig } from './boot-config.class';
import { BOOTSTRAP_CONFIGURATION_OPTIONS } from './bootstrap.constants';
import { BootstrapDiscovery } from './bootstrap.discovery';
import { BootstrapModuleOptions } from './interfaces/bootstrap-options.interface';

@Module({
  imports: [DiscoveryModule],
  providers: [],
  exports: [],
})
export class BootstrapModule {
  static forRoot(options?: BootstrapModuleOptions): DynamicModule {
    const bootOptionsProvider = {
      provide: BOOTSTRAP_CONFIGURATION_OPTIONS,
      useValue: assign(
        {
          filePath: resolve(__dirname, 'assets/bootstrap.yaml'),
        },
        options
      ),
    };

    return {
      module: BootstrapModule,
      providers: [
        bootOptionsProvider,
        BootConfig,
        BootConfigFileLoader,
        BootstrapDiscovery,
      ],
      exports: [BootConfig],
    };
  }
}
