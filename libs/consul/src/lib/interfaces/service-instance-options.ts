import { ServiceInstanceState } from '@nexuskit/common';

/**
 * Service instance options
 */
export interface ServiceInstanceOptions {
  /**
   * instanceId the id of the instance.
   */
  instanceId: string;

  /**
   * Node the id of the instance.
   */
  nodeID?: string;

  /**
   * serviceId the id of the service.
   */
  serviceId: string;

  /**
   * host where the service instance can be found.
   */
  host: string;

  /**
   * service instance status.
   */
  status?: string;

  /**
   * service tags.
   */
  tags?: string[];

  /**
   * port the port on which the service is running.
   */
  port: number;

  /**
   * secure indicates whether or not the connection needs to be secure.
   */
  secure: boolean;

  /**
   * node instance state.
   */
  state?: ServiceInstanceState;

  /**
   * metadata optional a map containing metadata.
   */
  metadata?: { [name: string]: string };
}
