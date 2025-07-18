import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  Registration,
  SERVICE_REGISTRY_CONFIG,
  Service,
  ServiceRegistry,
  ServiceStore,
  TtlScheduler,
  sleep,
} from '@nexuskit/common';
import ZooKeeper from 'zookeeper';
import { ZookeeperHeartbeatTask } from '../discovery/zookeeper-heartbeat.task';
import { ZookeeperClient } from '../zookeeper.client';
import { ZookeeperRegistration } from './zookeeper-registration';
import { ZookeeperRegistrationBuilder } from './zookeeper-registration.builder';
import { ZookeeperRegistryOptions } from './zookeeper-registry.options';

@Injectable()
export class ZookeeperServiceRegistry
  implements
    ServiceRegistry<ZookeeperRegistration>,
    OnModuleInit,
    OnModuleDestroy
{
  private readonly namespace = '/swft-mt-service';
  registration: Registration<Service> | undefined;
  ttlScheduler?: TtlScheduler;
  logger = new Logger(ZookeeperServiceRegistry.name);

  constructor(
    private readonly client: ZookeeperClient,
    @Inject(SERVICE_REGISTRY_CONFIG)
    private readonly options: ZookeeperRegistryOptions,
    private readonly serviceStore: ServiceStore,
  ) {}

  async init() {
    try {
      if (this.options.heartbeat == null) {
        throw Error('HeartbeatOptions is required');
      }

      if (this.options.discovery == null) {
        throw Error('ZookeeperDiscoveryOptions is required.');
      }

      if (
        !this.options.service?.name ||
        this.options.service.name.trim() === ''
      ) {
        throw Error('Service name is required');
      }

      this.registration = new ZookeeperRegistrationBuilder()
        .discoveryOptions(this.options.discovery)
        .heartbeatOptions(this.options.heartbeat)
        .host(this.options.service?.address)
        .port(this.options.service?.port || 0)
        .serviceName(this.options.service?.name || '')
        .tags(this.options.service?.tags || [])
        .status(this.options.service?.status || 'UP')
        .version(this.options.service?.version || '1.0.0')
        .metadata(this.options.service?.metadata || {})
        .instanceId(this.options.service?.id || '')
        .domain(this.options.service?.domain || 'swft-mt')
        .build();

      if (this.options.heartbeat.enabled) {
        const task = new ZookeeperHeartbeatTask(
          this.client,
          this.registration.getInstanceId(),
        );
        this.ttlScheduler = new TtlScheduler(this.options.heartbeat, task);
      }

      // Wait for zookeeper connection before proceeding
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
      while (!this.client.connected && attempts < maxAttempts) {
        this.logger.log(
          `Waiting for Zookeeper connection... (attempt ${attempts + 1}/${maxAttempts})`,
        );
        await sleep(1000);
        attempts++;
      }

      if (!this.client.connected) {
        throw new Error('Failed to connect to Zookeeper within timeout period');
      }

      this.logger.log('Zookeeper connected, proceeding with registration');

      await this.createNode();

      await this.watchAll();
    } catch (e) {
      this.logger.error('Error in init method:', e);
      // Re-throw validation errors but handle other errors gracefully
      if (
        e instanceof Error &&
        (e.message === 'HeartbeatOptions is required' ||
          e.message === 'ZookeeperDiscoveryOptions is required.' ||
          e.message === 'Service name is required' ||
          e.message === 'Failed to connect to Zookeeper within timeout period')
      ) {
        throw e;
      }
      // Don't throw other errors, just log them and continue
      // This prevents the application from crashing
    }
  }

  async close(): Promise<void> {
    await this.deregister();
    this.client.close();
  }

  getStatus<T>(): Promise<T> {
    return Promise.resolve(undefined as T);
  }

  setStatus<T>(status: T): Promise<void> {
    return Promise.resolve(undefined as void);
  }

  async onModuleInit() {
    try {
      await this.init();
      await this.register();
    } catch (error) {
      this.logger.error('Error in onModuleInit:', error);
      // Don't throw the error, just log it and continue
      // This prevents the application from crashing
    }
  }

  async onModuleDestroy() {
    try {
      if (this.registration) {
        await this.deregister();
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async register(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service registration is not initialized.');
    }
    this.logger.log(
      `registering service with id: ${this.registration.getInstanceId()}`,
    );
    try {
      const service = this.generateService();
      let attempts = 0;
      const maxAttempts = 5; // Limit retry attempts to prevent infinite loops

      while (attempts < maxAttempts) {
        try {
          // Wait for zookeeper connection
          if (!this.client.connected) {
            this.logger.warn('Waiting for Zookeeper connection...');
            await sleep(1000);
            attempts++;
            continue;
          }

          const key = [this.namespace, this.registration.getInstanceId()].join(
            '/',
          );
          await this.client.create(
            key,
            Buffer.from(JSON.stringify(service)),
            ZooKeeper.constants.ZOO_PERSISTENT,
          );
          this.logger.log('service registered');
          break;
        } catch (e) {
          attempts++;
          this.logger.error(
            `problem registering service, retrying... (attempt ${attempts}/${maxAttempts})`,
            e,
          );

          if (attempts >= maxAttempts) {
            this.logger.error(
              `Failed to register service after ${maxAttempts} attempts`,
            );
            throw e;
          }

          await sleep(3000);
        }
      }

      if (
        this.options.heartbeat?.enabled &&
        this.ttlScheduler != null &&
        this.options.heartbeat?.ttlInSeconds != null
      ) {
        this.ttlScheduler.add(this.registration.getInstanceId());
      }
    } catch (e) {
      if (this.options.discovery?.failFast) {
        throw e;
      }
      this.logger.warn(
        `Fail fast is false. Error registering service with Zookeeper: ${this.registration.getService()} ${e}`,
      );
    }
  }

  async deregister(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service registration is not initialized.');
    }
    this.logger.log(
      `Deregistering service with Zookeeper: ${this.registration.getInstanceId()}`,
    );

    try {
      this.ttlScheduler?.remove(this.registration.getInstanceId());

      const key = [this.namespace, this.registration.getInstanceId()].join('/');

      const [stats] = (await this.client.get(key, false)) as unknown as any[];
      await this.client.delete_(key, stats.version);
      this.logger.log(
        `Deregistered service with Zookeeper: ${this.registration.getInstanceId()}`,
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  private generateService(): Service {
    return {
      ...this.options.service,
      ...this.registration?.getService(),
    };
  }

  private async createNode() {
    try {
      await this.client.create(
        this.namespace,
        Buffer.from(''),
        ZooKeeper.constants.ZOO_PERSISTENT,
      );
      this.logger.log(`Namespace node ${this.namespace} created`);
    } catch (e: any) {
      // Log the full error for debugging
      this.logger.debug(`Error creating namespace node: ${JSON.stringify(e)}`);

      // Check for both string messages and numeric error codes
      const isNodeExistsError =
        (e.message &&
          (e.message.includes('node already exists') ||
            e.message.includes('ZNODEEXISTS'))) ||
        e.code === -110 ||
        (typeof e.getCode === 'function' && e.getCode() === -110) ||
        (e.message && e.message.includes('-110 node exists')) ||
        (e.message && e.message.includes('-110')) ||
        (e.toString && e.toString().includes('-110'));

      if (isNodeExistsError) {
        this.logger.warn(`Namespace node ${this.namespace} already exists`);
        return; // Don't throw, just return
      } else {
        this.logger.error(
          `Failed to create namespace node: ${e.message || e}`,
          e,
        );
        // Don't throw the error, just log it and continue
        // This prevents the application from crashing
      }
    }
  }

  private async watchAll() {
    if (!this.client.connected) {
      return;
    }
    try {
      // Bind the callback to preserve the 'this' context
      await this.setWatch(this.storeUpdate.bind(this));
    } catch (e) {
      this.logger.warn(
        `Failed to set up watching, continuing without watch: ${e}`,
      );
    }
  }

  private async storeUpdate(
    children: Array<string>,
    store: ServiceStore,
    logger: Logger,
  ) {
    try {
      const serviceMap: Map<string, any[]> = new Map();

      // Ensure children is an array and iterable
      if (!Array.isArray(children)) {
        logger.warn(
          'Children is not an array, skipping service discovery update',
        );
        return;
      }

      for (const child of children) {
        try {
          const key = [this.namespace, child].join('/');
          const result = await this.client.get(key, false);

          // The get method returns [data, stats], so we need to extract the data
          if (!Array.isArray(result) || result.length === 0) {
            logger.warn(`No data returned for service node ${child}`);
            continue;
          }

          const data = result[0];
          if (typeof data === 'undefined' || data === null) {
            logger.warn(`Null or undefined data for service node ${child}`);
            continue;
          }

          // Handle different data types properly
          let strData: string;
          if (Buffer.isBuffer(data)) {
            strData = data.toString('utf8');
          } else if (typeof data === 'string') {
            strData = data;
          } else if (typeof data === 'object' && data !== null) {
            // If it's already an object, try to stringify it
            try {
              strData = JSON.stringify(data);
            } catch (stringifyError) {
              logger.warn(
                `Failed to stringify object data for service node ${child}: ${stringifyError}`,
              );
              continue;
            }
          } else {
            logger.warn(
              `Unexpected data type for service node ${child}: ${typeof data}, value: ${data}`,
            );
            continue;
          }

          if (!strData || strData.trim() === '') {
            logger.warn(`Empty data for service node ${child}`);
            continue;
          }

          // Try to parse the JSON data
          let service: any;
          try {
            service = JSON.parse(strData);
          } catch (parseError) {
            logger.error(
              `Failed to parse JSON for service node ${child}. Data: "${strData}"`,
              parseError,
            );
            continue;
          }

          // Validate that we have a service object with a name
          if (!service || typeof service !== 'object' || !service.name) {
            logger.warn(
              `Invalid service data for node ${child}: missing name property`,
            );
            continue;
          }

          // Group by service name
          if (!serviceMap.has(service.name)) {
            serviceMap.set(service.name, []);
          }
          serviceMap.get(service.name)?.push(service);
        } catch (e) {
          logger.error(`Failed to fetch or parse service node ${child}:`, e);
        }
      }

      // Convert to ZookeeperServiceInstance and update store
      for (const [name, services] of serviceMap.entries()) {
        const instances = services.map(
          (svc) =>
            new (require('../discovery/zookeeper-service.instance').ZookeeperServiceInstance)(
              svc,
            ),
        );
        store.setServices(name, instances);
      }
    } catch (e) {
      logger.error('Error updating service store:', e);
    }
  }

  private async setWatch(
    callback: (
      children: any,
      serviceStore: ServiceStore,
      logger: Logger,
    ) => void,
  ) {
    try {
      // For now, just get children without watching to avoid the async callback issue
      const children = await this.client.get_children(this.namespace, false);

      // Call the callback directly without trying to get individual nodes
      // The callback will handle getting the individual nodes with proper paths
      callback(children, this.serviceStore, this.logger);
    } catch (e: any) {
      // Check if the error is because the namespace doesn't exist yet
      const isNamespaceNotExistsError =
        (e.message &&
          (e.message.includes('no node') || e.message.includes('NONODE'))) ||
        e.code === -101 ||
        (typeof e.getCode === 'function' && e.getCode() === -101) ||
        (e.message && e.message.includes('-101'));

      if (isNamespaceNotExistsError) {
        this.logger.warn(
          `Namespace ${this.namespace} doesn't exist yet, skipping watch setup`,
        );
      } else {
        this.logger.error('Error in setWatch:', e);
      }
    }
  }
}
