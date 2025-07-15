import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { BootConfig } from '@swft-mt/bootstrap';
import { isEmpty, isPlainObject, merge } from 'lodash';
import { ZookeeperModuleOptions } from './zookeeper-module.options';
import { ZOOKEEPER_CONFIG_OPTIONS } from './zookeeper.constant';

@Injectable()
export class ZookeeperConfig implements OnModuleInit {
  private options: ZookeeperModuleOptions | undefined;
  private CONFIG_PREFIX = 'clients.zookeeper';

  constructor(
    @Inject(ZOOKEEPER_CONFIG_OPTIONS) private opts: ZookeeperModuleOptions,
    @Optional() private readonly bootConfig: BootConfig,
  ) {}

  get config(): ZookeeperModuleOptions {
    if (!this.options) {
      throw new Error(
        `Zookeeper configuration option is not initialized. Please ensure the module is properly configured.`,
      );
    }

    return this.options;
  }

  onModuleInit() {
    let _tempConfig = {};

    if (this.bootConfig) {
      _tempConfig = this.bootConfig.get<ZookeeperModuleOptions>(
        this.CONFIG_PREFIX,
        this.opts,
      );
    }

    if (this.opts) {
      this.options = merge({}, this.opts, this.options, _tempConfig);
    }

    if (!isPlainObject(this.options) || isEmpty(this.options)) {
      throw new Error(
        `Zookeeper configuration option is missing in bootstrap and module config.`,
      );
    }
  }
}
