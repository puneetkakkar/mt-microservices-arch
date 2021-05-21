export class HealthCheck {
  /**
   * Initial delay value for the Health Check scheduler
   */
  initialDelay = 0;

  /**
   * Interval for rerunning the Health Check scheduler
   */
  interval = 25000;

  /**
   * Interval for refetching available service instance
   */
  refetchInstanceInterval = 25000;

  path: Map<String, String> = new Map();

  /**
   * Indicates whether the instances should be refetched by the
   * <code>HealthCheckServiceInstanceListSupplier</code>. This can be used if the
   * instance can be updated and the underlying delegates does not provide
   * an ongoing flux.
   */
  refetchInstances = false;

  /**
   * Indicates whether health checks should keep repeating. It might be useful to
   * set it to <code>false</code> if periodically refetching the instances, as every
   * refetch will also trigger a healthcheck.
   */
  repeatHealthCheck = true;
}
