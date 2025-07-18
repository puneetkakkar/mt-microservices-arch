import { HeartbeatOptions, PlainObject, Registration } from '@nexuskit/common';
import { ConsulDiscoveryOptions } from './consul-discovery.options';

export interface RegistrationBuilder {
  serviceName(name: string): RegistrationBuilder;

  tags(tags: string[]): RegistrationBuilder;

  instanceId(id: string): RegistrationBuilder;

  host(host: string): RegistrationBuilder;

  port(port: number): RegistrationBuilder;

  version(version: string): RegistrationBuilder;

  status(status: string): RegistrationBuilder;

  metadata(metadata: PlainObject): RegistrationBuilder;

  domain(domain: string): RegistrationBuilder;

  discoveryOptions(options: ConsulDiscoveryOptions): RegistrationBuilder;

  heartbeatOptions(options: HeartbeatOptions): RegistrationBuilder;

  build(): Registration<any>;
}
