import { Injectable } from '@nestjs/common';
import { BootConfigFileLoader } from './boot-config-file.loader';
import { BootstrapStore } from './bootstrap.store';

@Injectable()
export class BootConfig {
  constructor(
    private readonly bootConfigFileLoader: BootConfigFileLoader,
    private readonly bootstrapStore: BootstrapStore
  ) {
    this.bootstrapStore.data = this.bootConfigFileLoader.load();
  }

  get<T>(path?: string, defaults?: T): T {
    return this.bootstrapStore.get<T>(path, defaults);
  }
}
