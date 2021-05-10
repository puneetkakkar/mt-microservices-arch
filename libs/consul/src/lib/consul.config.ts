import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { BootConfig } from '@swft-mt/bootstrap';
import { isEmpty, isPlainObject, merge } from 'lodash';
import { CONSUL_CONFIG_OPTIONS } from './consul.constants';
import { ConsulModuleOptions } from './interfaces/consul-module.options';

@Injectable()
export class ConsulConfig implements OnModuleInit {
  private options: ConsulModuleOptions;
  private CONFIG_PREFIX = 'clients.consul';

  constructor(
    @Inject(CONSUL_CONFIG_OPTIONS) private opts: ConsulModuleOptions,
    @Optional() private readonly bootConfig: BootConfig
  ) {}

  get config(): ConsulModuleOptions {
    return this.options;
  }

  onModuleInit() {
    let _tempConfig = {};
    if (this.bootConfig) {
      _tempConfig = this.bootConfig.get<ConsulModuleOptions>(
        this.CONFIG_PREFIX,
        this.opts
      );
    }

    if (this.opts) {
      this.options = merge({}, this.opts, _tempConfig);
    }

    if (!isPlainObject(this.options) || isEmpty(this.options)) {
      throw new Error(
        'consul configuration is missing in bootstrap and module config'
      );
    }
  }
}
