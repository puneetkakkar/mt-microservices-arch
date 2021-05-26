import { LoadBalancerClient } from '@swft-mt/loadbalancer';
import { ClientOptions } from './interfaces';
import { HttpClient } from './transports/http.client';

export class ClientFactory {
  private static cache = new Map<string, HttpClient>();

  static create(lb: LoadBalancerClient, config: ClientOptions) {
    if (config.transport === 'http') {
      const client = new HttpClient(lb, config);
      return client;
    }
  }

  private static generateKey(config: ClientOptions) {
    const service = config.service || config.url;

    return `${service}/http/${config.url || ''}`;
  }
}
