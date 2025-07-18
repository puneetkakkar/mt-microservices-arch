import { PlainObject } from '../utils';
import { DiscoveryOptions } from './discovery-options.interface';
import { HeartbeatOptions } from './heartbeat.interface';
import { Registration } from './registration.interface';
import { ServiceRegistry } from './service-registry.interface';

export interface ServiceRegistryBuilder {
  build(): ServiceRegistry<Registration<any>>;
}

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

  discoveryOptions(options: DiscoveryOptions): RegistrationBuilder;

  heartbeatOptions(options: HeartbeatOptions): RegistrationBuilder;

  build(): Registration<any>;
}
