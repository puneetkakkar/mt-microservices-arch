import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { handleRetry } from '@nexuskit/common';
import { merge } from 'lodash';
import { defer, EMPTY, lastValueFrom } from 'rxjs';
import ZooKeeper from 'zookeeper';
import { ZookeeperConfig } from './zookeeper.config';

@Injectable()
export class ZookeeperClient
  extends ZooKeeper
  implements BeforeApplicationShutdown, OnModuleInit
{
  private opts = {};
  private readonly logg = new Logger(ZookeeperClient.name);
  public connected = false;

  constructor(private readonly options: ZookeeperConfig) {
    super({
      debug_level: ZooKeeper.constants.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false,
    });

    this.opts = {
      debug_level: ZooKeeper.constants.ZOO_LOG_LEVEL_WARN,
      host_order_deterministic: false,
    };
  }

  override close(): void {
    super.close();
  }

  // Expose ZooKeeper methods
  override async create(
    path: string,
    data: Buffer,
    flags: number,
  ): Promise<string> {
    return super.create(path, data, flags);
  }

  override async get(path: string, watch: boolean): Promise<any[]> {
    return super.get(path, watch);
  }

  override async delete_(path: string, version: number): Promise<void> {
    return super.delete_(path, version);
  }

  override async connect(): Promise<void> {
    this.opts = merge({}, this.opts, {
      connect: this.options.config.host,
      timeout: this.options.config.timeout,
      debug_level: this.options.config.logLevel,
      host_order_deterministic:
        this.options.config.hostOrderDeterministic ?? false,
    });

    try {
      await lastValueFrom(
        defer(async () => {
          this.once('connect', () => {
            this.connected = true;
            this.logg.log('Zookeeper client connected successfully');
          });

          super.connect(this.opts, () => {
            this.connected = true;
          });

          return EMPTY;
        }).pipe(
          handleRetry(
            this.options.config.retryAttempts,
            this.options.config.retryDelays,
            ZookeeperClient.name,
          ),
        ),
      );
    } catch (error) {
      this.connected = false;
      this.logg.error(`Failed to connect to Zookeeper: ${error}`);
    }
  }

  beforeApplicationShutdown() {
    this.close();
  }

  async onModuleInit() {
    await this.connect();
  }
}
