import { Provider } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { SERVICE_REGISTRY_CONFIG, ServiceStore } from '@swft-mt/common';
import { RegistryConfiguration } from '../interfaces';
import { validateRegistryOptions } from './validate-registry-options.util';

export function getSharedProviderUtils(
  options: RegistryConfiguration,
): Array<Provider> {
  const registryOption = validateRegistryOptions(options);

  const sharedProviders = [];
  const configProvider = {
    provide: SERVICE_REGISTRY_CONFIG,
    useValue: {},
  };

  if (registryOption.discoverer === 'consul') {
    const { ConsulServiceRegistry } = require('@swft-mt/consul');

    configProvider.useValue = {
      service: registryOption.service,
      discovery: {
        failFast: true,
        ...registryOption.discovery,
      },
      heartbeat: registryOption.heartbeat,
    };

    sharedProviders.push(ConsulServiceRegistry);
  } else if (registryOption.discoverer === 'zookeeper') {
    const importPackage = loadPackage(
      '@swft-mt/zookeeper',
      '@swft-mt/common',
      () => require('@swft-mt/zookeeper'),
    );

    configProvider.useValue = {
      service: registryOption.service,
      discovery: {
        failFast: true,
        ...registryOption.discovery,
      },
      heartbeat: registryOption.heartbeat,
    };

    sharedProviders.push(importPackage.ZookeeperServiceRegistry);
    sharedProviders.push(importPackage.ZookeeperDiscoveryClient);
  }

  sharedProviders.push(configProvider);
  sharedProviders.push(ServiceStore);

  return sharedProviders;
}
