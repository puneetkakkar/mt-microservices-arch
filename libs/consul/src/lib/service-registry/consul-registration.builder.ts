import { IpUtils, PlainObject, RegistrationBuilder } from '@swft-mt/common';
import * as uuid from 'uuid';
import {
  Check,
  ConsulDiscoveryOptions,
  HeartbeatOptions,
  Service,
} from '../interfaces';
import { ConsulRegistration } from './consul-registration';

export class ConsulRegistrationBuilder implements RegistrationBuilder {
  private _serviceName: string | undefined;
  private _port: number | undefined;
  private _host: string | undefined;
  private _status: string | undefined;
  private _version: string;
  private _tags: string[] | undefined;
  private _domain: string | undefined;
  private _meta: PlainObject | undefined;
  private _instanceId: string | undefined;
  private _heartbeatOptions: HeartbeatOptions | undefined;
  private _discoveryOptions: ConsulDiscoveryOptions | undefined;

  constructor(host?: string, port?: number) {
    this._host = host;
    this._port = port;
  }

  domain(domain: string): RegistrationBuilder {
    this._domain = domain || 'ultimate-backend';
    return this;
  }

  tags(tags: string[]): RegistrationBuilder {
    this._tags = tags;
    return this;
  }

  metadata(metadata: PlainObject): RegistrationBuilder {
    this._meta = metadata;
    return this;
  }

  state(metadata: PlainObject): RegistrationBuilder {
    this._meta = metadata;
    return this;
  }

  discoveryOptions(properties: ConsulDiscoveryOptions): RegistrationBuilder {
    this._discoveryOptions = properties;
    return this;
  }

  heartbeatOptions(properties: HeartbeatOptions): RegistrationBuilder {
    this._heartbeatOptions = properties;
    return this;
  }

  host(host: string): RegistrationBuilder {
    this._host = host;
    return this;
  }

  instanceId(id: string): RegistrationBuilder {
    this._instanceId = id;
    return this;
  }

  port(port: number): RegistrationBuilder {
    this._port = port;
    return this;
  }

  serviceName(name: string): RegistrationBuilder {
    this._serviceName = name;
    return this;
  }

  version(version: string): RegistrationBuilder {
    this._version = version || 'latest';
    return this;
  }

  status(status: string): RegistrationBuilder {
    this._status = status;
    return this;
  }

  build(): ConsulRegistration {
    if (!this._serviceName) {
      throw Error('Service name is required');
    }

    if (!this._host) {
      this._host = IpUtils.getIpAddress();
    }

    if (!this._port) {
      throw Error('Port is required');
    }

    if (!this._discoveryOptions) {
      throw Error('Dicovery options is required');
    }

    const scheme = this._discoveryOptions?.scheme;
    const isSecure = scheme == 'https';
    const domain = this._domain || 'swft-mt';

    const tags = ['service', this._version].concat(...(this._tags || []));
    const meta = {
      domain: domain,
      secure: `${isSecure}`,
      version: this._version,
      ...this._meta,
    };

    if (!this._instanceId) {
      this._instanceId = `${this._serviceName}-${uuid.v4()}`;
    } else {
      this._instanceId = `${this._instanceId}-${this._version}`;
    }

    if (
      this._heartbeatOptions.enabled &&
      !this._heartbeatOptions.ttlInSeconds
    ) {
      this._heartbeatOptions.ttlInSeconds = 120;
    }

    const check: Check = this.createCheck(this._discoveryOptions);

    const newService: Service = {
      name: this._serviceName,
      port: this._port,
      address: this._host,
      id: this._instanceId,
      tags,
      check,
      meta,
    };

    return new ConsulRegistration(newService, this._discoveryOptions);
  }

  private createCheck(opts: ConsulDiscoveryOptions): Check {
    const check: Partial<Check> = {
      service_id: opts.serviceId || this._instanceId,
      name: opts.serviceName || `${this._serviceName} Status`,
      interval: `${opts.interval || 10}s`,
    };

    if (opts?.notes) {
      check.notes = opts?.notes;
    }

    if (opts?.deregisterCriticalServiceAfter) {
      check.deregister_critical_service_after =
        opts?.deregisterCriticalServiceAfter;
    }

    switch (opts.type) {
      case 'tcp':
        check.tcp = opts?.tcp;
        if (!this._heartbeatOptions) {
          this._heartbeatOptions.enabled = true;
          this._heartbeatOptions.ttlInSeconds = 30;
        }
        break;
      case 'http':
        check.http = opts?.http;
        check.timeout = (opts?.timeout || 10) + 's';
        check.body = opts?.body;
        check.header = opts?.header;
        check.method = opts?.method;
        check.tls_skip_verify = opts?.skipVerifyTLS || true;
        break;
      default:
        check.ttl = '30s';
        break;
    }

    return check as Check;
  }
}
