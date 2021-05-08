import { Injectable } from '@nestjs/common';
import { BootConfigFileLoader } from './boot-config-file.loader';

@Injectable()
export class BootConfig {
  constructor(private readonly bootConfigFileLoader: BootConfigFileLoader) {
    this.bootConfigFileLoader.load();
  }

  get<T>() {}
}
