export class Retry {
  /**
   * Returns true if the load balancer should retry failed requests.
   * @return True if the load balancer should retry failed requests; false
   * otherwise.
   */

  enabled = true;

  /**
   * Indicates retries should be attempted on operations other than
   * {@link HttpMethod#GET}.
   */
  retryOnAllOperations = false;

  /**
   * Number of retries to be executed on the same <code>ServiceInstance</code>.
   */
  maxRetriesOnSameServiceInstance = 0;

  /**
   * Number of retries to be executed on the next <code>ServiceInstance</code>. A
   * <code>ServiceInstance</code> is chosen before each retry call.
   */
  maxRetriesOnNextServiceInstance = 1;

  /**
   * A {@link Set} of status codes that should trigger a retry.
   */
  retryableStatusCodes: Set<number> = new Set();

  /**
   * Properties for Reactor Retry backoffs in Spring Cloud LoadBalancer.
   */
  backoff: Backoff = new Backoff();
}

export class Backoff {
  /**
   * Indicates whether Reactor Retry backoffs should be applied.
   */
  enabled = false;

  /**
   * Used to set {@link RetryBackoffSpec#minBackoff}.
   */
  minBackoff = 5;

  /**
   * Used to set {@link RetryBackoffSpec#maxBackoff}.
   */
  maxBackoff = Number.MAX_VALUE;
}
