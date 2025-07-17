import {
    HeartbeatOptions,
    PlainObject,
    RegistrationBuilder,
    Service,
} from '@swft-mt/common';
import * as uuid from 'uuid';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';
import { ZookeeperRegistration } from './zookeeper-registration';

export class ZookeeperRegistrationBuilder {
  private _serviceName: string | undefined;
  private _port: number | undefined;
  private _host: string | undefined;
  private _status: string | undefined;
  private _version: string | undefined;
  private _tags: string[] | undefined;
  private _domain: string | undefined;
  private _meta: PlainObject | undefined;
  private _instanceId: string | undefined;
  private _heartbeatOptions: HeartbeatOptions | undefined;
  private _discoveryOptions: ZookeeperDiscoveryOptions | undefined;

  constructor(host?: string, port?: number) {
    this._host = host;
    this._port = port;
  }

  domain(domain: string): RegistrationBuilder {
    this._domain = domain || 'swft-mt';
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

  discoveryOptions(options: ZookeeperDiscoveryOptions): RegistrationBuilder {
    this._discoveryOptions = options;
    return this;
  }

  heartbeatOptions(options: HeartbeatOptions): RegistrationBuilder {
    this._heartbeatOptions = options;
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

  build(): ZookeeperRegistration {
    if (!this._serviceName) {
      throw Error('Service name is required');
    }

    if (!this._host) {
      throw Error('Host is required');
    }

    if (!this._port) {
      throw Error('Port is required');
    }

    if (!this._discoveryOptions) {
      throw Error('ZookeeperDiscoveryOptions is required');
    }

    const scheme = this._discoveryOptions.scheme;
    const isSecure = scheme == 'https';
    const domain = this._domain || 'swft-mt';

    const tags = ['service', this._version].concat(...(this._tags || []));
    const metadata = Object.assign(
      {},
      {
        domain: domain,
        secure: `${isSecure}`,
        version: this._version,
      },
      this._meta,
    );

    if (!this._instanceId) {
      this._instanceId = `service__${this._serviceName}__${this._version}-${uuid.v4()}`;
    } else {
      this._instanceId = `service__${this._serviceName}__${this._instanceId}-${this._version}`;
    }

    if (
      this._heartbeatOptions?.enabled &&
      !this._heartbeatOptions?.ttlInSeconds
    ) {
      this._heartbeatOptions.ttlInSeconds = 30;
    }

    let checks: any;

    if (Array.isArray(this._discoveryOptions)) {
      checks = this._discoveryOptions;
    } else {
      checks = this._discoveryOptions;
    }

    const newService: Service = {
      name: this._serviceName,
      port: this._port,
      address: this._host,
      id: this._instanceId,
      tags: tags.filter((tag): tag is string => typeof tag === 'string'),
      checks,
      metadata,
    };

    return new ZookeeperRegistration(newService, this._discoveryOptions);
  }

  version(version: string): RegistrationBuilder {
    this._version = version;
    return this;
  }

  status(status: string): RegistrationBuilder {
    this._status = status;
    return this;
  }
}
