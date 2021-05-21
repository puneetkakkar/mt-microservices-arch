import { ServiceInstance } from '@swft-mt/common';
import { BaseStrategy } from '..//base.strategy';

export interface ServiceInstanceChooser {
  /**
   * Choose a ServiceInstance from the LoadBalancer for the specified service
   * @param serviceId The service ID to look up the LoadBalancer
   * @returns A ServiceInstance that matches the serviceId
   */
  choose(serviceId: string): ServiceInstance;

  /**
   * Chooses a ServiceInstance from the LoadBalancer for the specified service strategy
   * @param serviceId The Service ID to look up the LoadBalancer.
   * @returns A BaseStrategy<ServiceInstance> that matches the service ID
   */
  chooseStrategy(serviceId: string): BaseStrategy<ServiceInstance>;
}
