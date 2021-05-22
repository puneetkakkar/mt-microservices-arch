import { LoadBalancerClient } from '@swft-mt/loadbalancer';
import { ClientOptions } from './interfaces';
import { HttpClient } from './transports/http.client';

export class ClientFactory {
  private static cache = new Map<string, any>();

  static create(
    lb: LoadBalancerClient,
    config: ClientOptions,
    force?: boolean
  ) {
    const key = this.generateKey(config);

    if (!this.cache.has(key) || force) {
      if (config.transport === 'http') {
        const client = new HttpClient(lb, config);
        this.cache.set(key, client);
        return client;
      }
    }
  }

  private static generateKey(config?: ClientOptions) {
    const service = config.service || config.url;

    return `${service}/http/${config.url || ''} `;
  }
}
