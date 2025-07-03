import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IReactiveClient } from '@swft-mt/common';
import * as ConsulStatic from 'consul';
import {
  Acl,
  Agent,
  Catalog,
  Event,
  Health,
  Kv,
  Lock,
  Session,
  Status,
  Watch,
} from 'consul';
import { ConsulConfig } from './consul.config';

@Injectable()
export class ConsulClient
  implements
    IReactiveClient<ConsulStatic.Consul>,
    ConsulStatic.Consul,
    OnModuleInit {
  public consul: ConsulStatic.Consul;

  acl: Acl;
  agent: Agent;
  catalog: Catalog;
  event: Event;
  health: Health;
  kv: Kv;
  session: Session;
  status: Status;

  constructor(public readonly options: ConsulConfig) {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async lock(opts: ConsulStatic.Lock.Options): Promise<Lock> {
    return (await this.consul).lock(opts);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async watch(opts: ConsulStatic.Watch.Options): Promise<Watch> {
    return (await this.consul).watch(opts);
  }

  /**
   * Close consul connection
   */
  close() {
    // close connection;
  }

  private _initFields(client: ConsulStatic.Consul) {
    this.acl = client.acl;
    this.agent = client.agent;
    this.catalog = client.catalog;
    this.event = client.event;
    this.health = client.health;
    this.kv = client.kv;
    this.session = client.session;
    this.status = client.status;
  }

  async connect(): Promise<void> {
    try {
      Logger.log('Consul Client starting...');

      // Create the consul instance
      this.consul = ConsulStatic({
        ...this.options.config,
        promisify: true,
      });

      Logger.log('Consul Client instance created');

      // Initialize the field references
      this._initFields(this.consul);

      Logger.log('Consul Client connected successfully');
    } catch (error) {
      Logger.error('Consul Client connection failed:', error);
      throw error;
    }
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }
}
