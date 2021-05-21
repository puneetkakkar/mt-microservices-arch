import { ServiceInstance } from '@swft-mt/common';
import { LoadBalancerRequest } from '../core/loadbalancer.request';

export interface ILoadBalancerClient {
  /**
   * Executes request using the ServiceInstance from the LoadBalancer for the specified service
   * @param serviceId The service ID to look up the LoadBalancer.
   * @param request Allows implementations to execute pre and post actions, such as incrementing metrics.
   * @returns the result of the LoadBalancerRequest callback on the selected ServiceInstance
   */
  execute<T>(serviceId: string, request: LoadBalancerRequest<T>): T;

  /**
   * Executes request using a ServiceInstance from the LoadBalancer for the specified
   * service.
   * @param serviceId The service ID to look up the LoadBalancer.
   * @param node
   * @param request Allows implementations to execute pre and post actions, such as
   * incrementing metrics.
   * @return The result of the LoadBalancerRequest callback on the selected
   * ServiceInstance.
   */
  execute<T>(
    serviceId: string,
    node: ServiceInstance,
    request: LoadBalancerRequest<T>
  ): T;
}
