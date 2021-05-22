import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  HttpClientExecuteException,
  ServerCriticalException,
  ServiceInstance,
  ServiceStore,
} from '@swft-mt/common';
import { BaseStrategy } from './base.strategy';
import { LoadBalancerRequest } from './core/loadbalancer.request';
import { ILoadBalancerClient } from './interfaces/loadbalancer-client.interface';
import { ServiceInstanceChooser } from './interfaces/service-instance-chooser.interface';
import { LoadBalancerConfig } from './loadbalancer.config';
import { ServiceInstancePool } from './service-instance-pool';
import { StrategyRegistry } from './strategy.registry';

@Injectable()
export class LoadBalancerClient
  implements ILoadBalancerClient, ServiceInstanceChooser, OnModuleInit {
  private readonly serviceStrategies = new Map<
    string,
    BaseStrategy<ServiceInstance>
  >();

  constructor(
    private readonly properties: LoadBalancerConfig,
    private readonly serviceStore: ServiceStore,
    private readonly registry: StrategyRegistry
  ) {}

  private init() {
    this.updateServices();
  }

  private updateServices() {
    const services = this.serviceStore.getServiceNames();
    for (const service of services) {
      const nodes = this.serviceStore.getServiceNodes(service);
      if (!service || this.serviceStrategies.has(service)) {
        continue;
      }

      const strategyName = this.properties.getStrategy(service);
      const strategy = this.registry.getStrategy(strategyName);

      if (strategy) {
        this.createStrategy(service, nodes, strategy);
      }
    }
  }

  private createStrategy(
    serviceName: string,
    nodes: ServiceInstance[],
    strategy: BaseStrategy<any>
  ) {
    strategy.init(serviceName, new ServiceInstancePool(serviceName, nodes));
    this.serviceStrategies.set(serviceName, strategy);
  }

  choose(serviceId: string): ServiceInstance {
    const strategy = this.serviceStrategies.get(serviceId);
    if (!strategy) {
      throw new Error(
        `service [${serviceId}] does not exist with loadbalance strategy`
      );
    }

    return strategy.choose();
  }

  chooseStrategy(serviceId: string): BaseStrategy<ServiceInstance> {
    const strategy = this.serviceStrategies.get(serviceId);
    if (!strategy) {
      throw new Error(`service [${serviceId}] does not exist`);
    }

    return strategy;
  }

  /**
   * Execute request
   * @param serviceId
   * @param request
   */
  execute<T>(serviceId: string, request: LoadBalancerRequest<T>): T;
  execute<T>(
    serviceId: string,
    nodes: ServiceInstance,
    request: LoadBalancerRequest<T>
  ): T;
  async execute<T>(
    serviceId: string,
    nodeOrRequest: LoadBalancerRequest<T> | ServiceInstance,
    request?: LoadBalancerRequest<T>
  ): Promise<T> {
    if (!serviceId) {
      throw new Error('serviceId is missing');
    }

    const [req, node] = request
      ? [request as LoadBalancerRequest<T>, nodeOrRequest as ServiceInstance]
      : [undefined, nodeOrRequest as ServiceInstance];

    if (node) {
      node.getState().incrementActiveRequests();
      node.getState().incrementRequestCounts();
      if (!node.getState().firstConnectionTimestamp) {
        node.getState().setFirstConnectionTime();
      }
    }

    const startTime = new Date().getTime();
    try {
      if (req.arguments.length === 0) {
        throw new HttpClientExecuteException('missing http request');
      }

      if (req.arguments[0] === undefined) {
        throw new HttpClientExecuteException('service not found');
      }

      const firstReq = req.arguments[0];
      const path = req.arguments[1];
      const opts = req.arguments[2];

      const response = await firstReq(path, opts);

      if (node) {
        const endTime = new Date().getTime();
        node.getState().setResponseTime(endTime - startTime);
        node.getState().decrementActiveRequests();
      }

      return response;
    } catch (e) {
      if (node) {
        node.getState().decrementActiveRequests();
      }
      if (e.response) {
        throw new HttpException(e.response.data, e.response.status);
      } else {
        if (node) {
          node.getState().incrementFailureCounts();
          node.getState().setConnectionFailedTime(e.message);
        }
        throw new ServerCriticalException(e.message);
      }
    }
  }

  onModuleInit(): any {
    this.init();
  }
}
