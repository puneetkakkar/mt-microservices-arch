import { LoadBalancerProperties } from '../config/load-balancer.properties';
import { LoadBalanceStrategy } from '../types';

export interface LoadBalancerModuleOptions {
  strategy?: LoadBalanceStrategy;
  services?: { name: string; strategy: string }[];
  // customStrategies?: ClassProvider<BaseStrategy<ServiceInstance>>[];
  options?: LoadBalancerProperties;
}
