import { HealthCheck } from './health-check';
import { Retry } from './retry.config';
import { StickySession } from './sticky-session';

export class LoadBalancerProperties {
  /**
   * Properties for <code>HealthCheckServiceInstanceListSupplier</code>.
   */
  healthCheck: HealthCheck = new HealthCheck();

  /**
   * Properties for Spring-Retry and Reactor Retry support in Spring Cloud LoadBalancer.
   */
  retry: Retry = new Retry();

  /**
   * Properties for LoadBalancer sticky-session.
   */
  stickySession: StickySession = new StickySession();
}
