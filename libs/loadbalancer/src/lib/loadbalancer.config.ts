import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { BootConfig } from '@nexuskit/bootstrap';
import { isEmpty, isPlainObject, merge } from 'lodash';
import { LoadBalancerModuleOptions } from './interfaces/loadbalancer-module-options.interface';
import { LOAD_BALANCE_CONFIG_OPTIONS } from './loadbalancer.constants';

@Injectable()
export class LoadBalancerConfig implements OnModuleInit {
  private options: LoadBalancerModuleOptions = {
    strategy: 'RandomStrategy',
  };
  private CONFIG_PREFIX = 'loadbalancer';

  constructor(
    @Inject(LOAD_BALANCE_CONFIG_OPTIONS)
    private opts: LoadBalancerModuleOptions,
    @Optional() private readonly bootConfig: BootConfig,
  ) {}

  get config(): LoadBalancerModuleOptions {
    return this.options;
  }

  public getServicesOption() {
    return this.options?.services || [];
  }

  public getGlobalStrategy() {
    return this.options?.strategy || 'RandomStrategy';
  }

  public getStrategy(serviceName: string) {
    const serviceOptions = this.getServicesOption();
    const serviceOption = serviceOptions.filter((item) => {
      return item.name === serviceName;
    })[0];

    if (!serviceOption) {
      return this.getGlobalStrategy();
    }
    return serviceOption.strategy;
  }

  onModuleInit(): any {
    let _tempConfig = {};
    if (this.bootConfig) {
      _tempConfig = this.bootConfig.get<LoadBalancerModuleOptions>(
        this.CONFIG_PREFIX,
        this.opts,
      );
    }

    if (this.opts) {
      this.options = merge(this.opts, this.options, _tempConfig);
    }

    if (!isPlainObject(this.options) || isEmpty(this.options)) {
      throw new Error(
        'loadbalancer configuration option is missing in bootstrap and module config',
      );
    }
  }
}
