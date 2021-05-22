import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ServiceStore, SERVICE_REGISTRY_CONFIG } from '@swft-mt/common';
import * as consul from 'consul';
import * as Consul from 'consul';
import { Watch } from 'consul';
import { isUndefined, omitBy } from 'lodash';
import { ConsulClient } from '../consul.client';
import { Service } from '../interfaces';
import { ConsulRegistryOptions } from '../interfaces/consul-registry.options';
import { Registration } from '../interfaces/registration.interface';
import { ConsulHeartbeatTask } from '../service-discovery/consul-heartbeat.task';
import { TtlScheduler } from '../service-health/ttl-scheduler';
import { consulServiceToServiceInstance } from '../utils/consul.utils';
import { ConsulRegistrationBuilder } from './consul-registration.builder';

import retry = require('retry');

import RegisterOptions = Consul.Agent.Service.RegisterOptions;

@Injectable()
export class ConsulServiceRegistry implements OnModuleInit, OnModuleDestroy {
  registration: Registration<Service>;
  ttlScheduler?: TtlScheduler;
  watcher: Watch;

  private readonly WATCH_TIMEOUT = 305000;
  private watchers: Map<string, Watch> = new Map();

  constructor(
    @Inject(SERVICE_REGISTRY_CONFIG)
    private readonly options: ConsulRegistryOptions,
    private readonly client: ConsulClient,
    private readonly serviceStore: ServiceStore
  ) {}

  async init() {
    if (this.options.heartbeat == null) {
      throw Error('HeartbeatOptions is required');
    }

    if (this.options.discovery == null) {
      throw Error('ConsulDiscoveryOptions is required.');
    }

    this.registration = new ConsulRegistrationBuilder()
      .discoveryOptions(this.options.discovery)
      .heartbeatOptions(this.options.heartbeat)
      .host(this.options.service?.address)
      .port(this.options.service?.port)
      .tags(this.options.service?.tags)
      .status(this.options.service?.status)
      .version(this.options.service?.version)
      .metadata(this.options.service?.metadata)
      .serviceName(this.options.service?.name)
      .instanceId(this.options.service?.id)
      .build();

    if (this.options.heartbeat.enabled) {
      const task = new ConsulHeartbeatTask(
        this.client,
        this.registration.getInstanceId()
      );
      this.ttlScheduler = new TtlScheduler(this.options.heartbeat, task);
    }

    // watch for service change
    this.watchAll();
  }

  private getToken(): { token?: string } {
    return this.client.options.config.aclToken
      ? { token: this.client.options.config.aclToken }
      : {};
  }

  private generateService(): RegisterOptions {
    let check = this.registration.getService().check;

    check = omitBy(check, isUndefined);
    const { checks, ...rest } = this.options.service;

    return {
      ...rest,
      ...this.registration.getService(),
      check,
      ...this.getToken(),
    };
  }

  private async _internalRegister(): Promise<void> {
    Logger.log(
      `registering service with id: ${this.registration.getInstanceId()}`
    );

    const service = this.generateService();
    await this.client.consul.agent.service.register(service);

    if (
      this.options.heartbeat.enabled &&
      this.ttlScheduler != null &&
      service.check?.ttl != null
    ) {
      this.ttlScheduler.add(this.registration.getInstanceId());
    }

    Logger.log('service registered');
  }

  async register(): Promise<any> {
    return new Promise<consul.Consul>((resolve, reject) => {
      const operation = retry.operation();
      operation.attempt(async () => {
        try {
          await this._internalRegister();
          resolve(null);
        } catch (e) {
          if (this.options.discovery.failFast) {
            Logger.warn(
              `Fail fast is false. Error registering service with consul: ${this.registration.getService()} ${e}`
            );
            reject(e);
          }
          if (operation.retry(e)) {
            return;
          }
          reject(e);
        }
      });
    });
  }

  async deregister(): Promise<void> {
    Logger.log(
      `Deregistering service with consul: ${this.registration.getInstanceId()}`
    );

    try {
      this.ttlScheduler?.remove(this.registration.getInstanceId());

      const options = {
        id: this.registration.getInstanceId(),
        ...this.getToken(),
      };
      await this.client.consul.agent.service.deregister(options);
      Logger.log(
        `Deregistered service with consul: ${this.registration.getInstanceId()}`
      );
    } catch (e) {
      Logger.error(e);
    }
  }

  private async buildServiceStore(services: string[]) {
    this.watchers.forEach((watcher) => watcher.end());
    this.watchers = new Map();

    await Promise.all(
      services.map(async (service: string) => {
        const nodes = (await this.client.consul.health.service(
          service
        )) as any[];
        const serviceNodes = consulServiceToServiceInstance(nodes);
        this.serviceStore.setServices(service, serviceNodes);
        this.watch(service);
      })
    );
  }

  private watch(serviceName: string) {
    if (!this.client.consul) {
      return;
    }

    if (this.watchers[serviceName]) {
      this.watchers[serviceName].end();
    }

    this.watchers[serviceName] = this.client.consul.watch({
      method: this.client.consul.health.service,
      options: {
        timeout: this.WATCH_TIMEOUT,
        service: serviceName,
        wait: '5m',
        ...this.getToken(),
      },
    });
    const watcher = this.watchers[serviceName];

    watcher.on('change', (nodes) => {
      const serviceNodes = consulServiceToServiceInstance(nodes);
      this.serviceStore.setServices(serviceName, serviceNodes);
    });
  }

  private watchAll() {
    if (!this.client.consul) {
      return;
    }

    this.watcher = this.client.consul.watch({
      method: this.client.consul.catalog.service.list,
      options: {
        timeout: this.WATCH_TIMEOUT,
        wait: '5m',
      },
    });

    this.watcher.on('change', async (data) => {
      const svcs = Object.keys(data).filter((value) => value !== 'consul');
      await this.buildServiceStore(svcs);
    });
  }

  async onModuleInit() {
    try {
      await this.init();
      await this.register();
    } catch (e) {
      Logger.error(e);
    }
  }

  async onModuleDestroy() {
    await this.deregister();
  }
}
