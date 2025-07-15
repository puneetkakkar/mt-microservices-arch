import {
  ConsulRegistryProviderOptions,
  ZookeeperRegistryProviderOptions,
} from './registry-options.interface';

export type RegistryConfiguration =
  | ConsulRegistryProviderOptions
  | ZookeeperRegistryProviderOptions;

export interface CloudModuleOptions {
  registry: RegistryConfiguration;
}
