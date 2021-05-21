import { Injectable, Logger } from '@nestjs/common';
import { ServiceInstance } from '@swft-mt/common';
import { LoadBalancerStrategy } from 'libs/loadbalancer/src/lib/decorators/loadbalancer-strategy.decorator';
import { random } from 'lodash';
import { BaseStrategy } from '../base.strategy';
import { ServiceInstancePool } from '../service-instance-pool';

@LoadBalancerStrategy()
@Injectable()
export class RandomStrategy extends BaseStrategy<ServiceInstance> {
  private serviceId: String;
  private serviceInstanceList: ServiceInstancePool;

  init(serviceName: string, list: ServiceInstancePool) {
    this.serviceId = serviceName;
    this.serviceInstanceList = list;
  }

  /**
   * Choose a service instance from the list of service pool
   */
  choose(): ServiceInstance {
    const liveServices = this.serviceInstanceList.get();
    const liveServicesCount = liveServices.length;

    if (liveServicesCount === 0) {
      Logger.error(`no live servers available for service: ${this.serviceId}`);
      return null;
    }

    return liveServices[random(0, liveServicesCount - 1)];
  }
}
