export class StickySession {
  /**
   * The name of the cookie holding the preferred instance id.
   */
  instanceIdCookieName = 'sc-lb-instance-id';

  /**
   * Indicates whether a cookie with the newly selected instance should be added by
   * SC LoadBalancer.
   */
  addServiceInstanceCookie = false;
}
