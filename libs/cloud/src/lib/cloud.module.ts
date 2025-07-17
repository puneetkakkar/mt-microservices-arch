import { DynamicModule, Global, Module } from '@nestjs/common';
import { CloudModuleOptions } from './interfaces';
import { CloudCoreModule } from './cloud-core.module';

@Global()
@Module({})
export class CloudModule {
  static forRoot(options: CloudModuleOptions): DynamicModule {
    return {
      module: CloudModule,
      imports: [CloudCoreModule.forRoot(options)],
    };
  }
}
